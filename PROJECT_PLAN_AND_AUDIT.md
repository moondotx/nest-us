# 🏗️ Nest App — Comprehensive Audit & Roadmap Plan

> **Date**: October 13, 2026  
> **Project**: Nest Booking (`nest-us`)  
> **Repository**: [https://github.com/moondotx/nest-us](https://github.com/moondotx/nest-us)  
> **Stack**: Next.js 14.2.5 (App Router), TypeScript, Tailwind CSS, Appwrite 16 (Auth, DB, Storage, Realtime)

---

## 1. Executive Summary

Nest is a Nigerian-focused property and flatmate matching platform combining:
1. **Space Booking** (hourly and short-stay workspaces, apartments, hostels, and hotel rooms).
2. **Flatmate Matching** (renter profiles, budget matching, neighbourhood preference, urgency).
3. **Direct Real-Time Messaging** (in-app chat between seekers, hosts, and prospective flatmates).
4. **Subscription & Boost Monetization** (tiered plans and 24-hr listing visibility boosts).

The codebase has a solid architectural core and high visual polish, but has several **critical data-loss bugs**, **pricing model discrepancies (USD vs NGN, hourly vs monthly)**, **schema synchronization gaps in Appwrite**, and **placeholder integrations (payments, reviews, profile persistence)** that must be fixed.

---

## 2. Full Codebase Inventory

| File / Route | Status | Description |
|---|---|---|
| `src/app/page.tsx` | 🟡 Needs Fix | Home discovery page. Hero search, location filter, space grid, stats, how it works. *(Issues: Price displayed as `$ /hr` instead of `₦`, duplicate `SpaceCard` component).* |
| `src/app/layout.tsx` | 🟢 Done | Root layout with font import, `AuthProvider`, and `NavbarWrapper`. |
| `src/app/globals.css` | 🟢 Done | Design tokens, button and card classes, animations (`fadeUp`, `marquee`). |
| `src/components/layout/Navbar.tsx` | 🟡 Needs Fix | Sticky navigation bar, desktop/mobile responsive, user menu dropdown. *(Issues: About/Privacy/Terms links point to `/`).* |
| `src/components/layout/NavbarWrapper.tsx` | 🟢 Done | Hides navbar on `/login`, `/signup`, `/oauth`. |
| `src/components/spaces/SpaceCard.tsx` | 🟡 Needs Fix | Listing preview card with type badge, rating, location, amenities. *(Issues: Hardcoded `$`).* |
| `src/app/login/page.tsx` | 🟡 Needs Fix | Split layout with testimonials, email/password login, Google OAuth. *(Issues: "Forgot password" unlinked).* |
| `src/app/signup/page.tsx` | 🔴 Broken | Split layout registration. *(Issues: Collects phone, gender, DOB, job, lifestyle, but discards them completely in `handleSubmit`).* |
| `src/app/oauth/page.tsx` | 🟢 Done | Handles OAuth session exchange and redirects to homepage. |
| `src/app/create/page.tsx` | 🟢 Done | Modal-style landing picker to route between listing a space vs listing as a flatmate. |
| `src/app/list-space/page.tsx` | 🔴 Broken | 4-step wizard for property listings. *(Issues: Collects monthly rent in ₦ but home displays hourly $, lacks custom title, uploads `mediaIds` not in Appwrite schema).* |
| `src/app/spaces/[id]/page.tsx` | 🟡 Needs Fix | Space details, photo/video gallery with lightbox, views counter, booking calculator, host chat. *(Issues: Hardcoded `$`, Report button does nothing).* |
| `src/app/flatmates/page.tsx` | 🟢 Done | Flatmate directory with budget range (`₦`), urgency badges, and location tags. |
| `src/app/flatmates/new/page.tsx` | 🟢 Done | Flatmate profile creation with avatar upload or color picker, budget range, preferred neighbourhoods. |
| `src/app/flatmates/[id]/page.tsx` | 🟡 Needs Fix | Flatmate detail profile with safety tips and renter summary. *(Issues: "Start a chat" button is missing CSS styling).* |
| `src/app/messages/page.tsx` | 🟢 Done | Conversation inbox with search, context preview, and unread badges. |
| `src/app/messages/[id]/page.tsx` | 🟢 Done | Chat room with Appwrite Realtime subscriptions, optimistic UI updates, day grouping, auto-scroll. |
| `src/app/dashboard/page.tsx` | 🟢 Done | Host dashboard with stats (listings, bookings, earnings, rating), listing deletion, and host booking list. |
| `src/app/bookings/page.tsx` | 🟢 Done | Guest bookings list with status badges and cancel booking flow. |
| `src/app/plans/page.tsx` | 🟡 WIP | Subscription tiers and boost packages. *(Issues: Payments are alerts without Paystack/Flutterwave).* |
| `src/app/profile/page.tsx` | 🔴 Broken | Profile settings and notification toggles. *(Issues: Does not save avatar, phone, gender, DOB, job, lifestyle, or notification toggles).* |
| `src/lib/appwrite.ts` | 🟢 Done | Appwrite Client, Account, Databases, Storage initializations. |
| `src/lib/auth.ts` | 🟡 Needs Fix | Auth wrappers (`signUp`, `logIn`, `logOut`, `getCurrentUser`). *(Issues: `signUp` doesn't accept extra profile attributes).* |
| `src/lib/spaces.ts` | 🟡 Needs Fix | CRUD for spaces, file uploads, view tracking. *(Issues: `mediaIds` mismatch with setup script).* |
| `src/lib/bookings.ts` | 🟡 Needs Fix | Booking CRUD, availability check. *(Issues: `checkAvailability` queries unindexed fields).* |
| `src/lib/flatmates.ts` | 🟢 Done | Flatmate queries and document creation. |
| `src/lib/messages.ts` | 🟡 Needs Fix | Messaging helpers, conversations query, real-time subscriber. *(Issues: Single unread counter for whole conversation instead of per-user).* |
| `scripts/setup-appwrite.mjs` | 🟡 Needs Fix | Database setup script. *(Issues: Missing `mediaIds` attribute in spaces, missing indexes in bookings).* |
| `scripts/setup-flatmates.mjs` | 🟢 Done | Database setup script for flatmates. |
| `scripts/setup-messages.mjs` | 🟢 Done | Database setup script for conversations & messages. |

---

## 3. What Was Done Right (Strengths & Accomplishments)

1. **Modern Next.js 14 & Appwrite Integration**:
   - Clean separation of client and server concerns, fast bundle, modern app directory layout.
   - Live subscriptions via `client.subscribe` for real-time messaging without polling.
2. **Strong Aesthetic & UI Polish**:
   - Custom palette (`--green: #1a6b3c`, `--accent: #f4a427`) tailored for the Nigerian ecosystem.
   - Interactive components: media lightbox with keyboard listeners, optimistic chat sending, step progress bar in listing creation.
3. **Dual Discovery Model**:
   - Combining traditional space rental (offices, apartments, shortlets) with roommate matching (`flatmates`) differentiates the product from standard Airbnb clones.
4. **Conversations with Context**:
   - Conversations store `contextType`, `contextId`, and `contextTitle`, so a chat clearly indicates "re: Lekki Studio Apartment" or "re: Ayodele".
5. **Zero TypeScript Errors**:
   - Strict TypeScript compilation (`tsc --noEmit`) passes cleanly with zero compile errors.

---

## 4. What Was Done Wrong (Critical Bugs & Architectural Flaws)

### 🔴 Critical Issues

1. **Silent Data Loss in Sign-Up (`src/app/signup/page.tsx`)**:
   - The user fills out an onboarding form with phone number, gender, date of birth, job title, employer, student/professional status, and lifestyle tags.
   - `handleSubmit` executes:
     ```ts
     await signUp(name, email, password);
     ```
   - All other collected fields are completely lost.
   - **Fix**: Save extra fields to Appwrite user preferences (`account.updatePrefs(...)`) or create a dedicated `users` profile collection in Appwrite.

2. **Broken Profile Persistence (`src/app/profile/page.tsx`)**:
   - `handleSave()` ONLY runs `account.updateName(fullName)`.
   - The user avatar is picked and previewed, but `uploadFile` is never called.
   - Phone, gender, DOB, occupation, lifestyle tags, and notification toggles are never persisted.
   - Existing values are not pre-populated from Appwrite when the page opens.

3. **Currency & Billing Discrepancy (Severe Model Conflict)**:
   - **Spaces**: The homepage and space detail page display `$ /hr` (e.g. `$150/hr`).
   - **List Space Form**: The form asks for `Monthly Rent in ₦` (Naira).
   - A host entering `150000` (meaning ₦150k/month) results in a listing showing `$150,000 /hr`.
   - **Fix**: Standardize on **Naira (`₦`)** and allow hosts to specify the rental frequency:
     - Per Hour (for Offices / Meeting rooms)
     - Per Night (for Shortlets / Hotel rooms)
     - Per Month / Per Year (for Apartments / Flatshares)

4. **Appwrite Schema Desynchronization (`scripts/setup-appwrite.mjs` vs `src/lib/spaces.ts`)**:
   - `createSpace()` writes an attribute `mediaIds` (`JSON.stringify(data.mediaIds)`).
   - In `setup-appwrite.mjs`, the `spaces` collection does NOT define a `mediaIds` string attribute.
   - If this attribute is missing on Appwrite Cloud, document creation will throw an error.
   - In `src/lib/bookings.ts`, `checkAvailability()` queries `Query.equal("date", date)` and `Query.notEqual("status", "cancelled")`, but `date` and `status` have no indexes in `setup-appwrite.mjs`.

5. **Unstyled Button in Flatmate Detail (`src/app/flatmates/[id]/page.tsx`)**:
   - Lines 232-240 render the "Start a chat" button with only hover callbacks and zero CSS classes or inline styles.

6. **Fulltext Search Fragility in Messaging (`src/lib/messages.ts`)**:
   - `getMyConversations()` runs `Query.search("participantIds", userId)`.
   - Fulltext indexing on JSON strings (`["id1","id2"]`) with alphanumeric IDs can be unreliable across different Appwrite database backends (min word lengths, punctuation). A structured index or two explicit participant attributes (`participant1`, `participant2`) is standard practice.

7. **Duplicated Component Code**:
   - `SpaceCard` is declared inside `src/components/spaces/SpaceCard.tsx` and duplicated in `src/app/page.tsx`.

8. **Missing `.eslintrc.json` & Build-Breaking ESLint Errors**:
   - Running `next lint` or `next build` fails with ESLint errors caused by unescaped JSX characters (`'` and `"`):
     - `src/app/flatmates/new/page.tsx:102` (`'`)
     - `src/app/flatmates/[id]/page.tsx:112` (`'`)
     - `src/app/list-space/page.tsx:298, 332` (`'`)
     - `src/app/login/page.tsx:51, 70, 168` (`"` and `'`)
     - `src/app/page.tsx:305` (`'`)
     - `src/app/signup/page.tsx:88` (`'`)
   - These will cause production deployments (such as Vercel) to fail immediately during `next build`.

---

## 5. What is Still Work In Progress (WIP / Missing Features)

1. **Payment Processing (Paystack / Flutterwave)**:
   - Subscriptions and Boost checkout currently trigger JavaScript `alert()` dialogs.
   - Bookings are confirmed instantly without upfront payment or escrow.
2. **Review & Rating System**:
   - Ratings are hardcoded or set to `0`. No review submission form or review collection exists.
3. **Password Reset Flow**:
   - "Forgot password?" is unclickable text on the login page.
4. **Host Approval Workflow**:
   - Bookings are immediately created as `confirmed`. Hosts cannot accept, reject, or request reschedule.
5. **Search Enhancements & Maps**:
   - No map visualization (Google Maps / Mapbox / Leaflet) for property locations.
   - No price range sliders or amenity filter toggles on the discovery page.
6. **Notification System**:
   - No email triggers (e.g. Resend, Sendgrid, or Appwrite Cloud Functions) on new booking, new message, or cancellation.

---

## 6. Phased Implementation Roadmap

### Phase 1: Critical Bug Fixes & Schema Integrity (Immediate)
- [ ] Add `.eslintrc.json` so linting and CI/CD pipelines succeed.
- [ ] Align Appwrite attributes: Add `mediaIds` to `spaces` collection and create indexes for `date` and `status` in `bookings`.
- [ ] Standardize currency to Naira (`₦`) across all pages (`page.tsx`, `SpaceCard.tsx`, `spaces/[id]`, `dashboard`, `bookings`).
- [ ] Add billing frequency selector in space creation (`/hr`, `/night`, `/month`, `/year`) and display accordingly.
- [ ] Fix unstyled "Start a chat" button on `/flatmates/[id]`.
- [ ] Deduplicate `SpaceCard` so `page.tsx` imports from `@/components/spaces/SpaceCard`.

### Phase 2: User Profile & Auth Data Persistence
- [ ] Update `signUp` and `useAuth` to persist full profile data (phone, gender, DOB, job, lifestyle) via Appwrite `account.updatePrefs()` or a `profiles` collection.
- [ ] Complete `src/app/profile/page.tsx` so avatars upload to Appwrite Storage and all fields load and save properly.
- [ ] Implement the "Forgot Password" reset request modal/flow using Appwrite Account recovery API (`account.createRecovery`).

### Phase 3: Booking & Host Operations
- [ ] Change booking creation to `status: "pending"` by default.
- [ ] Add host action buttons in `/dashboard` (Accept / Decline incoming bookings).
- [ ] Display space title and direct links in the host bookings table.

### Phase 4: Monetization & Payments
- [ ] Integrate **Paystack** inline popup for:
  - Booking payments / security deposit
  - Subscription tier upgrades (`Basic`, `Premium`)
  - Listing Boost purchases (`1 Boost`, `3 Boosts`, `10 Boosts`)
- [ ] Create an Appwrite collection or user preference field for active subscriptions and boost balances.

### Phase 5: Reviews, Maps & Notifications
- [ ] Build a `reviews` collection and review widget on space detail pages.
- [ ] Add interactive map or geolocation picker for listings.
- [ ] Configure Appwrite Functions or Webhooks to send email alerts for bookings and unread messages.
