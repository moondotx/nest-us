# 📋 Nest Booking — Project Progress & Task Tracker

> **Repository**: [https://github.com/moondotx/nest-us](https://github.com/moondotx/nest-us)  
> **Working Branch**: `my-feature-branch`  
> **Last Updated**: October 13, 2026  
> **Status**: 🟡 Development & Stabilization

---

## 🧭 Quick Summary for Collaborators

Nest is a Next.js 14 + Appwrite platform for **space bookings** (offices, apartments, shortlets) and **flatmate matchmaking** across Nigeria.

This living document tracks:
- **Active Focus**: What is being built/fixed right now.
- **Immediate Next Up**: The exact tasks queued next.
- **Completed**: Features built and verified.
- **Bugs & Data Flaws**: Issues identified in the codebase audit that need addressing.
- **Roadmap**: Phased milestones towards production readiness.

---

## 🎯 Current Status & Active Focus

### 🟡 IN PROGRESS (Active Now)
| ID | Area | Task | Assignee / Priority | Notes |
|---|---|---|---|---|
| **ACT-01** | Stabilization | Environment & Linter Initialization | 🔴 High | Created `.eslintrc.json`, configured `.env.local` with team credentials |
| **ACT-02** | Pricing & Currency | Currency standardization to Nigerian Naira (`₦`) | 🔴 Critical | Fixing `$ /hr` on homepage & space detail to align with `₦` used in listing creation |

---

## ⚡ Immediate Next Up (What Needs to Be Done Next)

These tasks are ready to be picked up immediately in order of priority:

1. **[FIX-01] Fix Signup Data Loss (`src/app/signup/page.tsx`)**
   - *Problem*: Signup form collects phone, gender, DOB, occupation, and lifestyle, but discards them on submission.
   - *Action*: Persist user profile data into Appwrite user preferences (`account.updatePrefs`) or a user profile document upon sign-up.

2. **[FIX-02] Fix Profile Persistence & Avatar Upload (`src/app/profile/page.tsx`)**
   - *Problem*: Profile settings only updates user's name; avatar file upload and preferences are ignored.
   - *Action*: Wire avatar image upload to Appwrite Storage bucket and persist preferences so the page loads and saves all fields.

3. **[FIX-03] Fix Build-Breaking ESLint Entities**
   - *Problem*: Unescaped quotes (`'` and `"`) fail `next build` / Vercel deployments.
   - *Files*: `src/app/flatmates/new/page.tsx`, `src/app/flatmates/[id]/page.tsx`, `src/app/list-space/page.tsx`, `src/app/login/page.tsx`, `src/app/page.tsx`, `src/app/signup/page.tsx`.

4. **[FIX-04] Fix Unstyled "Start a chat" Button on Flatmate Profile**
   - *Problem*: `src/app/flatmates/[id]/page.tsx` line 232 button has hover events but lacks base CSS / Tailwind classes.

5. **[FIX-05] Align Appwrite Schema & Indexes**
   - *Problem*: `src/lib/spaces.ts` sends `mediaIds` which is missing from `scripts/setup-appwrite.mjs`. Bookings queries lack indexes on `date` and `status`.

---

## ✅ What Has Been Done So Far

### 1. Project Infrastructure & Dev Setup
- [x] Cloned repository and configured Git upstream sync.
- [x] Configured team Appwrite credentials in `.env.local` (Database `69b60e5000314cb6d208`, Bucket `69b610bf000e6df92b3f`).
- [x] Installed project dependencies (`npm install`).
- [x] Next.js dev server up and running on port 3000.
- [x] Created `.env.local.example` template for onboarding new contributors.
- [x] Added `.eslintrc.json` config.
- [x] Conducted full codebase audit (`PROJECT_PLAN_AND_AUDIT.md`).

### 2. Space Discovery & Detail
- [x] Homepage hero with search query and Lagos area dropdown filter.
- [x] Category filtering by space type (`office`, `apartment`, `hostel`, `hotel`).
- [x] Space detail page with image/video carousel and full-screen lightbox modal.
- [x] Dynamic view counter incrementing on space visits.
- [x] Availability conflict detection for booking time slots.
- [x] Host & guest card badges and amenities display.

### 3. Flatmates Matchmaking
- [x] Flatmates discovery feed with budget range, urgency badges, and location tags.
- [x] Flatmate profile creator (`/flatmates/new`) with avatar upload or color picker.
- [x] Flatmate profile detail page (`/flatmates/[id]`) with safety guidelines and renter info.
- [x] Category picker page (`/create`) routing users to either list a space or create a flatmate profile.

### 4. Realtime In-App Messaging
- [x] Contextual conversation creation (linking chats directly to a space or flatmate profile).
- [x] Conversation inbox (`/messages`) with search and unread badges.
- [x] Real-time chat room (`/messages/[id]`) with optimistic message dispatch and Appwrite Realtime subscriptions.
- [x] Message grouping by date ("Today", "Yesterday", and formatted dates).

### 5. Dashboards & Accounts
- [x] Host dashboard (`/dashboard`) displaying total listings, confirmed bookings, and earnings.
- [x] Host listing management (delete space capability).
- [x] Guest bookings page (`/bookings`) with reservation history and cancellation.
- [x] Google OAuth flow (`/oauth`) and email/password authentication foundation.

---

## 🐛 Bug & Issue Tracker

| Status | Issue Code | Description | Affected Files | Severity |
|---|---|---|---|---|
| 🔴 OPEN | `BUG-01` | Signup form silently drops phone, gender, DOB, job, and lifestyle inputs | `src/app/signup/page.tsx`, `src/lib/auth.ts` | Critical |
| 🔴 OPEN | `BUG-02` | Profile page does not upload avatar or save any fields except name | `src/app/profile/page.tsx` | High |
| 🔴 OPEN | `BUG-03` | Price model conflict: USD per hour (`$ /hr`) vs NGN per month (`₦ /mo`) | `src/app/page.tsx`, `src/components/spaces/SpaceCard.tsx`, `src/app/spaces/[id]/page.tsx`, `src/app/list-space/page.tsx` | High |
| 🔴 OPEN | `BUG-04` | Unescaped JSX entities break production builds | 6 files across `src/app/` | High |
| 🔴 OPEN | `BUG-05` | Space creation writes `mediaIds`, but `setup-appwrite.mjs` lacks attribute | `scripts/setup-appwrite.mjs`, `src/lib/spaces.ts` | Medium |
| 🔴 OPEN | `BUG-06` | Flatmate profile detail "Start a chat" button lacks base styles | `src/app/flatmates/[id]/page.tsx` | Medium |
| 🟡 OPEN | `BUG-07` | Fulltext query on `participantIds` JSON string is fragile in messaging | `src/lib/messages.ts` | Medium |
| 🟡 OPEN | `BUG-08` | Duplicate `SpaceCard` implementation in `src/app/page.tsx` | `src/app/page.tsx`, `src/components/spaces/SpaceCard.tsx` | Low |
| 🟡 OPEN | `BUG-09` | Dead links in Navbar (About, Terms, Privacy point to `/`) | `src/components/layout/Navbar.tsx` | Low |
| 🟡 OPEN | `BUG-10` | "Forgot password?" is unlinked text | `src/app/login/page.tsx` | Low |

---

## 🗺️ Phased Implementation Roadmap

### Phase 1: Core Integrity & Quick Fixes 👈 *(CURRENT MILESTONE)*
- [ ] Standardize currency to `₦` across all space views.
- [ ] Allow spaces to set rate period: per hour, per night, per month.
- [ ] Fix ESLint unescaped entities to enable error-free `npm run build`.
- [ ] Style the "Start a chat" button on `/flatmates/[id]`.
- [ ] Deduplicate `SpaceCard` component.

### Phase 2: User Profiles & Authentication Integrity
- [ ] Persist all sign-up fields (phone, gender, DOB, occupation, lifestyle) to Appwrite user preferences.
- [ ] Finish `/profile` page: enable avatar image uploads and persist all fields.
- [ ] Implement password reset recovery flow via Appwrite Account Recovery API.

### Phase 3: Host Booking Operations
- [ ] Change booking creation to initial `status: "pending"`.
- [ ] Add Host Accept / Reject booking controls on `/dashboard`.
- [ ] Add direct booking status notifications in the messaging thread.

### Phase 4: Monetization & Payments
- [ ] Integrate **Paystack** inline checkout for:
  - Space booking deposits
  - Subscription tier upgrades (`Basic ₦5,000`, `Premium ₦15,000`)
  - Listing Boost purchases (`1 Boost`, `3 Boosts`, `10 Boosts`)
- [ ] Track active subscriptions & boost counters in Appwrite.

### Phase 5: Reviews, Maps & Notifications
- [ ] Create `reviews` collection and review submission widget.
- [ ] Add interactive map preview for space locations.
- [ ] Implement email notifications for new bookings and new messages.

---

## 🛠️ Instructions for Collaborators

### Running the Project Locally
```powershell
# 1. Pull latest changes
git pull origin my-feature-branch

# 2. Install dependencies (if any new packages were added)
npm install

# 3. Start development server
npm run dev
# App will run at http://localhost:3000
```

### Git Commit Guidelines
When completing tasks from this file, reference the task ID in your commit:
```powershell
git add .
git commit -m "fix(FIX-01): persist user profile data on signup"
git push origin my-feature-branch
```
