# TechSeals PM

Consulting project and capacity management built with **Next.js**, **Firebase Auth**, **Firestore**, and **Firebase App Hosting**.

## Features (current scaffold)

- Email/password authentication (admin + consultant roles)
- i18n: English (default) + Dutch
- Admin: dashboard shell, consultant CRUD with **job role**, **seniority**, weekly capacity
- Consultant: read-only view of active project assignments
- Firestore security rules (role-based)
- Firebase App Hosting config (`apphosting.yaml`)

## Prerequisites

- Node.js 20+
- Firebase project `techseals-pm` on **Blaze** plan
- Email/Password auth enabled in Firebase Console
- Firestore database created

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local — add FIREBASE_SERVICE_ACCOUNT_KEY for admin API routes
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Create the first admin user

1. Firebase Console → Project Settings → Service accounts → Generate new private key
2. Export the JSON as a single-line env var:

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
npx tsx scripts/create-admin.ts admin@yourcompany.com YourSecurePassword "Admin Name"
```

### Deploy Firestore rules

```bash
firebase deploy --only firestore:rules --project techseals-pm
```

## Firebase App Hosting deploy

App Hosting deploys from **GitHub** (not local CLI upload).

1. Push this repo to GitHub
2. Firebase Console → **Hosting & Serverless → App Hosting → Get started**
3. Connect GitHub repo, set root directory to `/`
4. Add secret `FIREBASE_SERVICE_ACCOUNT_KEY` in App Hosting environment settings
5. Add remaining `NEXT_PUBLIC_FIREBASE_*` vars (or use `.env.local` transfer on backend setup)
6. Deploy

Docs: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting/get-started)

## Data model

- `users` — auth profile + role (`admin` | `consultant`)
- `clients` — client records
- `consultants` — name, email, jobRole, seniority, weeklyCapacityHours
- `projects` — linked to client, dates, status, priority, etc.
- `assignments` — consultant + project with `segments[]` for mid-project changes

## Next iterations

- Clients & projects CRUD
- Assignment matrix (Assign + Capacity tabs)
- Dashboard metrics from live Firestore data
