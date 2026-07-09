# ASF Shopee — Full Platform Setup Guide

Premium e-commerce platform: one website + three Expo apps, all sharing a single
Firebase backend, Cloudinary for image storage, and a Node/Express API deployed
on **Render**.

```
ASF Shopee/
├── website/          Next.js 15 storefront (Tailwind, Framer Motion, lucide icons)
├── customer-app/      Expo app — shopping, checkout, live order tracking
├── admin-app/         Expo app — dashboard, order management, notifications
├── shop-owner-app/     Expo app — product upload (images -> Cloudinary)
├── backend/           Express API on Render — Firebase Admin + Cloudinary + Razorpay
└── shared/theme.js    Shared color tokens used across all apps
```

All icons use **Ionicons / lucide-react** — no emojis anywhere in the UI.

---

## 1. Prerequisites

- Node.js 18+ and npm
- A [Firebase](https://console.firebase.google.com) project
- A [Cloudinary](https://cloudinary.com) account (free tier is enough to start)
- A [Render](https://render.com) account (for the backend API)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli` (or use `npx expo`)
- (Optional) [Razorpay](https://razorpay.com) account for online payments
- A Google Maps API key (Maps SDK for Android/iOS + JavaScript API enabled)

---

## 2. Firebase Setup (shared by all 4 apps)

1. Create a Firebase project → enable:
   - **Authentication** → Sign-in method → Google
   - **Firestore Database** (production mode)
   - **Cloud Messaging** (FCM)
2. Create collections (they will also be created automatically on first write):
   `users, products, orders, categories, addresses, cart, notifications, deliveryPartners, shops, offers, wishlist, reviews`
3. Deploy the provided security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```
   (rules file: `backend/firestore/firestore.rules`)
4. Generate a **Web app** config (Project settings → General → Your apps → Web) —
   you'll paste these values into `website/.env.local` and each Expo app's `app.config`.
5. Generate a **Service Account key** (Project settings → Service accounts →
   Generate new private key). This JSON is used only by the backend.
   ```bash
   base64 -w0 serviceAccountKey.json   # Linux
   base64 serviceAccountKey.json       # macOS
   ```
   Save the resulting single-line string — you'll paste it into Render as
   `FIREBASE_SERVICE_ACCOUNT_BASE64`.
6. Set custom claims for roles (run once per user, e.g. via a small admin script
   using `firebase-admin`):
   ```js
   admin.auth().setCustomUserClaims(uid, { role: "admin" }); // or "shopOwner", "delivery"
   ```

---

## 3. Cloudinary Setup

1. Get your **Cloud Name, API Key, API Secret** from the Cloudinary dashboard.
2. Create an **unsigned upload preset** (Settings → Upload → Add upload preset,
   mode = Unsigned) — name it e.g. `asf_shopee_unsigned`. This is used by the
   website for direct browser uploads.
3. The Shop Owner app instead uploads through the backend (`/api/upload`), which
   uses your API Secret securely (never exposed to the mobile client).

**Why the website only needs Cloud Name + Upload Preset (no API Key/Secret):**
An unsigned preset lets the browser upload directly to Cloudinary without
proving identity with a secret — Cloudinary enforces the preset's
pre-configured rules (folder, allowed formats, size limits) instead. This is
intentional and safe: the Cloud Name + Preset name are meant to be public.
The **API Key + Secret are more powerful** (they can delete/list/modify any
asset) and are only ever used **server-side**, in `backend/.env` — never in
the website or any mobile app bundle, because anything shipped to a browser
or device can be extracted by an attacker.

---

## 4. Backend Setup (deploy to Render)

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # local dev on http://localhost:10000
```

Fill in `.env`:
- `FIREBASE_SERVICE_ACCOUNT_BASE64` — from step 2.5 above
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (optional, for online payments)

**Deploy to Render:**
1. Push this `backend/` folder to a GitHub repo (or the whole ASF Shopee repo).
2. On Render: **New → Web Service** → connect the repo → set root directory to
   `backend` → it will auto-detect `render.yaml`.
3. Add the environment variables listed above in the Render dashboard
   (Environment tab) — they are marked `sync: false` in `render.yaml` so Render
   will prompt you to fill them in.
4. Deploy. Your API will be live at `https://<your-service>.onrender.com`.
5. Test: `curl https://<your-service>.onrender.com/health`

API surface:
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/products` | List/search products |
| POST | `/api/products` | Create product (Shop Owner/Admin) |
| GET | `/api/orders` | List orders (own or all for Admin) |
| POST | `/api/orders` | Create order at checkout |
| PATCH | `/api/orders/:id/status` | Update order status (Admin) |
| PATCH | `/api/orders/:id/location` | Update live delivery GPS |
| POST | `/api/upload` | Upload image to Cloudinary |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment signature |

---

## 5. Website Setup (Next.js)

```bash
cd website
cp .env.local.example .env.local
npm install
npm run dev     # http://localhost:3000
```

Fill in `.env.local`:
- Firebase web config values (from step 2.4)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `NEXT_PUBLIC_API_BASE_URL` → your Render backend URL + `/api`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Deploy anywhere that supports Next.js (Vercel recommended): `npm run build && npm start`.

---

## 6. Mobile Apps Setup (Expo — customer-app, admin-app, shop-owner-app)

Each app is independent but shares the same Firebase project and backend API.
Each app now has a real **`.env`** workflow (loaded via the `dotenv` package
inside `app.config.js`, which replaces the old static `app.json`):

```bash
cd customer-app        # repeat for admin-app and shop-owner-app
cp .env.example .env   # then fill in the real values
npm install
npx expo start
```

`app.config.js` reads `process.env.*` (populated from `.env` by
`require("dotenv/config")`) and exposes them under `expo.extra`, which the
app reads at runtime via `Constants.expoConfig?.extra` (see `lib/firebase.ts`,
`lib/api.ts`). You don't need to hand-edit `app.config.js` — just fill in `.env`.

`.env` is **not** picked up automatically by EAS Build (cloud builds don't
see your local filesystem). For real device builds, mirror the same values as
EAS secrets:
```bash
eas secret:create --name FIREBASE_API_KEY --value "your-value"
eas secret:create --name GOOGLE_MAPS_API_KEY --value "your-value"
# ...repeat for each variable in .env.example
```
EAS automatically injects secrets as `process.env.*` during the build, so
`app.config.js` picks them up the same way it does locally.

**Assets** — drop your real files into each app's `assets/` folder before
building:
```
assets/images/logo.png, logo_dark.png, splash.png
assets/maps/marker.png
assets/animations/success.json, delivery.json, loading.json   (Lottie files)
assets/fonts/Poppins-Regular.ttf, Poppins-Bold.ttf
```

Run on a device/simulator:
```bash
npx expo start        # scan QR with Expo Go, or press "a" / "i" for emulator
```

Build production binaries with [EAS Build](https://docs.expo.dev/build/introduction/):
```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

---

## 7. Payments

Two options are wired in:

- **Razorpay (recommended)** — `backend/src/routes/payments.js` creates orders
  and verifies signatures server-side. Fully automatic UPI/card/wallet payments.
- **Cash on Delivery** — no integration needed, just mark the order `pending`
  until delivery.

A plain UPI deep-link option (no gateway) is *not* wired in by default because
it can't auto-verify payment — use Razorpay for a trustworthy automated flow.

---

## 8. Notifications (FCM)

- Each app registers for push notifications (`expo-notifications`) and saves
  the device token to the user's Firestore document as `fcmToken`.
- The backend sends notifications via `firebase-admin`'s `messaging.send()`
  whenever an order status changes, a new order is placed, or a new user
  registers (see `backend/src/routes/orders.js`).

---

## 9. Color Theme (used everywhere)

| Token | Hex |
|---|---|
| Primary (Gun Metal Grey) | `#2B343C` |
| Secondary (Metallic Copper) | `#B87333` |
| Accent | `#F5F5F5` |
| Success | `#27AE60` |
| Warning | `#F39C12` |
| Danger | `#E74C3C` |
| Background | `#101214` |
| Card | `#1A1D22` |

Defined once in `shared/theme.js` and mirrored in `website/tailwind.config.ts`
and each Expo app's `lib/theme.ts`.

---

## 10. What's included vs. what you still need to build

This package gives you a **production-shaped scaffold**: shared backend,
Firebase/Cloudinary/Razorpay wiring, navigation structure, the full color
theme, icon-based UI (no emojis), and the core screens/routes described in the
spec (home, search, product, cart, checkout, order tracking, admin dashboard,
order management, shop-owner product upload).

Still to do for a full production launch:
- Wire remaining screens (cart, wishlist, reviews, offers) to live Firestore data
- Order-success animation (Lottie `success.json` + confetti) — drop your Lottie
  file into `assets/animations/` and render it with `lottie-react-native`
- Delivery partner location updates every few seconds (call
  `PATCH /api/orders/:id/location` from the delivery partner's device/app)
- App Store / Play Store listings and EAS build profiles
- Automated tests and CI/CD

---

## Support

If any step is unclear, the inline code comments in each route/screen explain
exactly what Firestore/Cloudinary/Firebase calls are expected there.
