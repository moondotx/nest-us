# 🏗️ Nest Booking

A full-stack office & apartment booking app built with **Next.js 14** and **Appwrite** as the backend-as-a-service.

## Features

- **Authentication** — Sign up, log in, log out via Appwrite Auth
- **Browse listings** — Filter by office / apartment, search by name & location
- **Space detail** — Full info page with booking widget and availability check
- **List a space** — Hosts upload photos and publish listings
- **Book a space** — Date + time picker, cost calculator, conflict detection
- **My bookings** — Guests view and cancel bookings
- **Host dashboard** — Manage listings, view all incoming bookings, earnings summary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Appwrite Databases |
| Auth | Appwrite Authentication |
| Storage | Appwrite Storage |
| Styling | Tailwind CSS + DM Serif Display / DM Sans |
| Icons | Lucide React |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd nest-booking
npm install
```

### 2. Create an Appwrite project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) (or your self-hosted instance)
2. Create a new project — note your **Project ID**
3. Go to **Project Settings → Platforms** → Add a **Web** platform
   - Name: `Nest Booking`
   - Hostname: `localhost` (add your production domain later)

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=nest_db
NEXT_PUBLIC_APPWRITE_SPACES_COLLECTION=spaces
NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION=bookings
NEXT_PUBLIC_APPWRITE_BUCKET_ID=space_images
```

### 4. Run the automated database setup

This script creates all collections, attributes, indexes, and the storage bucket automatically.

```bash
# Install the server-side Appwrite SDK (only needed for this script)
npm install node-appwrite --save-dev

# Generate a Server API Key:
# Appwrite Console → Project Settings → API Keys → Create Key
# Grant: databases.read, databases.write, storage.read, storage.write

# Add to .env.local:
# APPWRITE_API_KEY=your_server_api_key_here

node scripts/setup-appwrite.mjs
```

Expected output:
```
🏗️  Nest Booking — Appwrite Setup

📦  Creating database...
  ✅  Database: nest_db

📋  Creating Spaces collection...
  ✅  Collection: spaces
  ✅  Attr: spaces.title
  ...

📋  Creating Bookings collection...
  ✅  Collection: bookings
  ...

🗄️   Creating Storage bucket...
  ✅  Bucket: space_images

✅  Setup complete!
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Manual Appwrite Setup (alternative to script)

If you prefer to set up manually in the Appwrite Console:

### Database

Create a database with ID matching `NEXT_PUBLIC_APPWRITE_DATABASE_ID`.

### Spaces Collection

ID: `spaces` | Permissions: Any (read), Users (create/update/delete)

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| title | String(255) | ✅ | |
| type | Enum | ✅ | Values: `office`, `apartment` |
| description | String(2000) | ❌ | |
| price | Float | ✅ | Per hour |
| location | String(500) | ✅ | |
| capacity | Integer | ✅ | |
| amenities | String(2000) | ❌ | JSON array stored as string |
| availability | String(255) | ❌ | e.g. "Mon–Fri, 9am–6pm" |
| imageId | String(255) | ❌ | Appwrite file ID |
| hostId | String(255) | ✅ | Appwrite user $id |
| hostName | String(255) | ✅ | |
| rating | Float | ❌ | Default 0 |
| reviewCount | Integer | ❌ | Default 0 |

Indexes: `type` (key), `hostId` (key)

### Bookings Collection

ID: `bookings` | Permissions: Users (read/create/update/delete)

| Attribute | Type | Required |
|-----------|------|----------|
| spaceId | String(255) | ✅ |
| spaceName | String(255) | ✅ |
| spaceType | String(50) | ✅ |
| spaceLocation | String(500) | ✅ |
| userId | String(255) | ✅ |
| userName | String(255) | ✅ |
| userEmail | String(255) | ✅ |
| date | String(20) | ✅ | Format: YYYY-MM-DD |
| startTime | String(10) | ✅ | Format: HH:MM |
| endTime | String(10) | ✅ | Format: HH:MM |
| hours | Float | ✅ | |
| totalPrice | Float | ✅ | |
| status | Enum | ✅ | Values: `pending`, `confirmed`, `cancelled` |
| hostId | String(255) | ✅ | |

Indexes: `userId` (key), `hostId` (key), `spaceId` (key)

### Storage Bucket

ID: `space_images` | Permissions: Any (read), Users (create/delete)
Max file size: 10MB | Allowed types: jpg, jpeg, png, webp, avif

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home — browse listings
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Sign up
│   ├── spaces/[id]/page.tsx  # Space detail + booking
│   ├── list-space/page.tsx   # Host: create listing
│   ├── bookings/page.tsx     # Guest: my bookings
│   ├── dashboard/page.tsx    # Host: dashboard
│   ├── layout.tsx            # Root layout + providers
│   └── globals.css
├── components/
│   ├── layout/Navbar.tsx
│   └── spaces/SpaceCard.tsx
├── hooks/
│   └── useAuth.tsx           # Auth context + hook
├── lib/
│   ├── appwrite.ts           # Appwrite client setup
│   ├── auth.ts               # signUp, logIn, logOut, getCurrentUser
│   ├── spaces.ts             # CRUD for spaces + image upload
│   └── bookings.ts           # CRUD for bookings + availability check
scripts/
└── setup-appwrite.mjs        # One-time DB/collection setup
```

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.

Then in Appwrite Console → **Project Settings → Platforms**, add your Vercel domain as a web platform.

### Environment variables for production

Copy all variables from `.env.local` into your hosting provider's environment settings. Never commit `.env.local` to git.

---

## Extending the App

| Feature | Where to add |
|---------|-------------|
| Reviews & ratings | New `reviews` collection + UI on `/spaces/[id]` |
| Payments | Stripe or Paystack in `/spaces/[id]` before `createBooking` |
| Email notifications | Appwrite Functions triggered on booking create |
| Maps | Google Maps or Mapbox in `SpaceCard` / detail page |
| Admin panel | New `/admin` route with server-side Appwrite API key |
| Recurring bookings | Add `recurrence` field to bookings collection |

---

## Troubleshooting

**"User not authenticated" on form submit**
→ Your session expired or was never created. Make sure `account.createEmailPasswordSession()` succeeds in `auth.ts` before calling `account.get()`.

**"Collection not found"**
→ The collection ID in `.env.local` doesn't match what's in Appwrite Console. IDs are case-sensitive.

**Images not loading**
→ Check `next.config.mjs` — add your Appwrite hostname to `remotePatterns`. Also confirm the bucket permissions allow `Role.any()` to read.

**CORS errors**
→ In Appwrite Console → Project Settings → Platforms, make sure `localhost` (dev) and your production domain are both added as Web platforms.
# nest
