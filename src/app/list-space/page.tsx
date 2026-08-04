"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createSpace, uploadFiles, getFileUrl } from "@/lib/spaces";
import { X, Upload, Play, ChevronLeft, ChevronRight, Info, Lightbulb, Sparkles } from "lucide-react";

// ── Amenity data ──────────────────────────────────────────────────────────────
const AMENITIES = {
  "In the home": [
    "In-unit laundry", "Wifi included", "Utilities included", "Unfurnished",
    "Furnished", "Semi-Furnished", "Air-Conditioning", "TV",
    "Private bath", "Pets-Friendly", "Large closet", "Balcony",
  ],
  "On the property": [
    "Exercise equipment", "Elevator", "Free parking", "Outdoor space",
    "Swimming Pool", "Fire pit",
  ],
  "Safety": [
    "Smoke alarm", "First aid kit", "Fire extinguisher",
    "Security system", "Must climb stairs",
  ],
};

const LISTING_TYPES = ["Entire Apartment", "Shared Apartment", "Shortlet", "Office", "Hostel", "Hotel"];
const DURATIONS = ["Short stay (daily)", "Monthly", "Yearly", "Flexible"];
const BEDROOMS = ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4 Bedrooms", "5+ Bedrooms"];
const BATHROOMS = ["1 Bath", "2 Baths", "3 Baths", "4+ Baths"];
const PROPERTY_TYPES = ["Apartment / Flat", "Detached House", "Semi-Detached", "Terraced", "Bungalow", "Duplex", "Mini flat", "Self-con"];
const GENDERS = ["No preference", "Male only", "Female only"];

type MediaFile = { file: File; preview: string; isVideo: boolean };

// ── Progress bar ──────────────────────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? "var(--green)" : "#e5e7eb", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

// ── Tag toggle button ─────────────────────────────────────────────────────────
function Tag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
      border: `1.5px solid ${active ? "var(--green)" : "#d1d5db"}`,
      background: active ? "var(--green)" : "white",
      color: active ? "white" : "#374151",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
    }}>
      {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white", flexShrink: 0 }} />}
      {label}
    </button>
  );
}

// ── Hint box ──────────────────────────────────────────────────────────────────
function Hint({ type, children }: { type: "fyi" | "tip" | "new" | "prompt"; children: React.ReactNode }) {
  const styles = {
    fyi: { bg: "#eff6ff", border: "#bfdbfe", label: "FYI", labelBg: "#2563eb", color: "#1e40af" },
    tip: { bg: "#f0fdf4", border: "#bbf7d0", label: "TIP", labelBg: "#16a34a", color: "#15803d" },
    new: { bg: "#f0fdf4", border: "#bbf7d0", label: "NEW!", labelBg: "#16a34a", color: "#15803d" },
    prompt: { bg: "#f0fdf4", border: "transparent", label: "PROMPTS", labelBg: "transparent", color: "#15803d" },
  }[type];
  return (
    <div style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: styles.labelBg, color: "white", flexShrink: 0, marginTop: 1 }}>{styles.label}</span>
      <div style={{ fontSize: 13, color: styles.color, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ── Select dropdown ───────────────────────────────────────────────────────────
function Select({ value, options, onChange, placeholder }: { value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", background: "white", fontSize: 14, color: value ? "#111827" : "#9ca3af", appearance: "none", cursor: "pointer", outline: "none" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronRight size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none", color: "#6b7280" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ListSpacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);

  // Step 1
  const [address, setAddress] = useState("");
  const [listingType, setListingType] = useState("Entire Apartment");
  const [availableDate, setAvailableDate] = useState("");
  const [duration, setDuration] = useState("");

  // Step 2
  const [bedrooms, setBedrooms] = useState("1 Bedroom");
  const [bathrooms, setBathrooms] = useState("1 Bath");
  const [propertyType, setPropertyType] = useState("Apartment / Flat");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Step 3
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [genderPref, setGenderPref] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");

  // Step 4
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newMedia = files.map(file => ({
      file, preview: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video"),
    }));
    setMediaFiles(prev => [...prev, ...newMedia].slice(0, 10));
  };

  const removeMedia = (i: number) => setMediaFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!user) { router.push("/login"); return; }
    if (mediaFiles.length < 3) { setError("Please upload at least 3 photos."); return; }
    setError(""); setUploading(true); setUploadProgress(10);

    try {
      const mediaIds = await uploadFiles(mediaFiles.map(m => m.file));
      setUploadProgress(80);

      // Map listing type to our space types
      const typeMap: Record<string, "office" | "apartment" | "hostel" | "hotel"> = {
        "Entire Apartment": "apartment", "Shared Apartment": "apartment",
        "Shortlet": "apartment", "Office": "office",
        "Hostel": "hostel", "Hotel": "hotel",
      };

      await createSpace({
        title: `${listingType} in ${address}`,
        type: typeMap[listingType] ?? "apartment",
        description: description + (genderPref ? `\n\nRoommate preference: ${genderPref}` : ""),
        price: Number(monthlyRent) || 0,
        location: address,
        capacity: parseInt(bedrooms) || 2,
        amenities: selectedAmenities,
        availability: availableDate || "Flexible",
        imageId: mediaIds[0] ?? null,
        mediaIds,
        hostId: user.$id,
        hostName: user.name,
        views: 0,
      });

      setUploadProgress(100);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to create listing");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;
  if (!user) { router.push("/login"); return null; }

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 16 }}>
      {children}
    </div>
  );

  const SectionLabel = ({ text }: { text: string }) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>{text}:</p>
  );

  const FieldLabel = ({ text }: { text: string }) => (
    <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>{text}</label>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>Create Listing</h1>
          <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Step {step} of 4</span>
        </div>
        <div style={{ marginBottom: 28 }}>
          <StepBar step={step} total={4} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
              Back
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => {
              if (step === 1 && !address) { setError("Please enter an address."); return; }
              setError(""); setStep(s => s + 1);
            }}
              style={{ padding: "8px 24px", border: "none", borderRadius: 8, background: "var(--green)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={uploading}
              style={{ padding: "8px 24px", border: "none", borderRadius: 8, background: uploading ? "#9ca3af" : "var(--green)", color: "white", fontSize: 14, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}>
              {uploading ? `Uploading... ${uploadProgress}%` : "Submit"}
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>{error}</div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <Card>
              <FieldLabel text="Address" />
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, area, city and state"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <div style={{ marginTop: 10 }}>
                <Hint type="fyi">For safety, only enter street, area, city and state — not house number.</Hint>
              </div>
            </Card>

            <Card>
              <FieldLabel text="Listing Type" />
              <Select value={listingType} options={LISTING_TYPES} onChange={setListingType} />
            </Card>

            <Card>
              <FieldLabel text="Monthly Rent (₦)" />
              <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} placeholder="e.g. 500000"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </Card>

            <Card>
              <FieldLabel text="Available date" />
              <input type="date" value={availableDate} onChange={e => setAvailableDate(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <div style={{ marginTop: 10 }}>
                <Hint type="tip">Your listing will be deactivated shortly after the available date has passed</Hint>
              </div>
            </Card>

            <Card>
              <FieldLabel text="Duration" />
              <Select value={duration} options={DURATIONS} onChange={setDuration} placeholder="Select duration category..." />
            </Card>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <Card>
              <SectionLabel text="Layout" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <FieldLabel text="Bedrooms" />
                  <Select value={bedrooms} options={BEDROOMS} onChange={setBedrooms} />
                </div>
                <div>
                  <FieldLabel text="Bathrooms" />
                  <Select value={bathrooms} options={BATHROOMS} onChange={setBathrooms} />
                </div>
              </div>
              <FieldLabel text="Property type" />
              <Select value={propertyType} options={PROPERTY_TYPES} onChange={setPropertyType} />
            </Card>

            <Card>
              <SectionLabel text="Description" />
              <Hint type="prompt">
                <span style={{ fontWeight: 700 }}>What's a typical day like?</span><br />
                What features make this space unique?
              </Hint>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={5} placeholder="Describe your space..."
                style={{ width: "100%", marginTop: 12, padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ marginTop: 10, fontSize: 13, color: "#16a34a" }}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>TIPS</span>
                Describe the neighborhood and nearby amenities. Any additional utilities or services included?
              </div>
            </Card>

            <Card>
              <SectionLabel text="Amenities" />
              {Object.entries(AMENITIES).map(([group, items]) => (
                <div key={group} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 10 }}>{group}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {items.map(a => (
                      <Tag key={a} label={a} active={selectedAmenities.includes(a)} onClick={() => toggleAmenity(a)} />
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            <Card>
              <SectionLabel text="Roommate Preferences" />
              <Hint type="new">
                Searches using Best Match will automatically filter results based on your preferences here. If this section doesn't apply to you, leave as default.
              </Hint>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20, marginBottom: 16 }}>
                <div>
                  <FieldLabel text="Min age" />
                  <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} placeholder="18"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <FieldLabel text="Max age" />
                  <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} placeholder="99"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <FieldLabel text="Gender Preference" />
              <Select value={genderPref} options={GENDERS} onChange={setGenderPref} placeholder="Select gender preference..." />
            </Card>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div>
            <Card>
              <SectionLabel text="Photos" />

              {/* Guidelines */}
              <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Info size={15} color="#d97706" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Upload Guidelines</span>
                </div>
                <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, marginBottom: 8 }}>
                  Please upload <strong>good and clear pictures or videos</strong>. They should look appealing to users so they can easily get people interested in your listing. <strong>We might reject listings with bad pictures.</strong>
                </p>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                  <span>• 3–5 Files Required</span>
                  <span>• Must Click Upload Button</span>
                </div>
              </div>

              {/* Upload button */}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", background: mediaFiles.length >= 3 ? "var(--green)" : "#f3f4f6", border: `2px dashed ${mediaFiles.length >= 3 ? "var(--green)" : "#d1d5db"}`, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: mediaFiles.length >= 3 ? "white" : "#6b7280", marginBottom: 12, boxSizing: "border-box" }}>
                <Upload size={16} />
                Choose Photos & Videos
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaChange} />
              </label>

              {/* Count indicator */}
              {mediaFiles.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 12 }}>
                  <span style={{ color: "#6b7280" }}>
                    {mediaFiles.length} / 10 media selected (min: 3) &nbsp;·&nbsp;
                    {mediaFiles.filter(m => !m.isVideo).length} images &nbsp;
                    {mediaFiles.filter(m => m.isVideo).length} videos
                  </span>
                  {mediaFiles.length >= 3 && (
                    <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>{mediaFiles.length} ready to upload</span>
                  )}
                </div>
              )}

              {/* Upload action button */}
              {mediaFiles.length >= 3 && !uploading && (
                <button onClick={handleSubmit}
                  style={{ width: "100%", padding: "13px", background: "var(--green)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>
                  Upload {mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""}
                </button>
              )}

              {/* Progress bar */}
              {uploading && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 8, background: "#e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--green)", width: `${uploadProgress}%`, transition: "width 0.3s", borderRadius: 8 }} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--green)", marginTop: 6, fontWeight: 600 }}>Uploading... {uploadProgress}%</p>
                </div>
              )}

              {/* Selected media preview */}
              {mediaFiles.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    <Upload size={14} /> Selected Media ({mediaFiles.length})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {mediaFiles.map((m, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "2px solid #e5e7eb" }}>
                        {m.isVideo ? (
                          <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <video src={m.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                              <Play size={20} color="white" fill="white" />
                            </div>
                          </div>
                        ) : (
                          <img src={m.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        {/* remove button */}
                        <button onClick={() => removeMedia(i)}
                          style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={12} color="white" />
                        </button>
                        {/* index badge */}
                        <div style={{ position: "absolute", top: 5, left: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  {mediaFiles.length < 3 && (
                    <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8, fontWeight: 600 }}>At least 3 photos is required</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
