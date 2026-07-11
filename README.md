# ASF Shopee — Premium Grocery Commerce Platform

A production-ready grocery commerce app built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Framer Motion. It runs as a single Vercel-deployable project and includes:

- **Storefront** — animated brand splash, category browsing, search, product detail pages with strikethrough MRP/savings, cart, and checkout.
- **Auth** — Firebase Google Sign-In. Browsing is open to everyone; sign-in is only required at purchase time.
- **Onboarding** — after sign-in, a 3-step flow collects **phone number** (no OTP/verification step, used only for delivery coordination) → **address** → **interactive map pin** (OpenStreetMap/Leaflet, no API key required), then returns the user straight back to checkout.
- **Order tracking** — live-updating (polling every 5s) progress through Placed → Confirmed → Packed → Dispatched → Out for Delivery → Delivered, plus delivery partner contact once assigned.
- **Admin dashboard** (`/admin`) — combines product management (create/edit/delete, multi-image upload to Cloudinary, stock/pricing/discount) and order management (status updates, which sync instantly to the customer's tracking page). Restricted to emails listed in `ADMIN_EMAILS`.
- **Data layer** — MongoDB via Mongoose; product stock automatically decrements on order and shows "Out of Stock" at zero.

> Note on real-time: this build uses fast polling (every 5s) for order status/tracking instead of a persistent Socket.IO server, because Vercel's serverless functions don't hold long-lived socket connections. If you need true push-based websockets, deploy a small Socket.IO relay separately (e.g. on Render) and wire it into the `orders/[id]` page — the data model already supports it.

---

## 1. Prerequisites

You will need free/paid accounts for:

1. **MongoDB Atlas** — https://www.mongodb.com/cloud/atlas (free tier is enough)
2. **Firebase** — https://console.firebase.google.com (Authentication + Google provider)
3. **Cloudinary** — https://cloudinary.com (free tier is enough)
4. **Vercel** — https://vercel.com (for deployment)

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in every value before running locally. The same variables must be added in **Vercel → Project → Settings → Environment Variables** before deploying.

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Atlas → Database → Connect → Drivers → copy connection string, replace `<password>` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Your apps → Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same as above |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console → Project Settings → Service Accounts → **Generate new private key** (downloads a JSON file). Paste the full JSON contents as the value (or base64-encode the file first and paste that — both are supported) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_KEY` | same as above |
| `CLOUDINARY_API_SECRET` | same as above |
| `ADMIN_EMAILS` | Comma-separated list of emails allowed into `/admin`, e.g. `owner@asf.com,manager@asf.com` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Same list as `ADMIN_EMAILS` (exposed to the browser purely to show/hide the Admin nav link — the API always re-checks server-side) |

### Firebase setup steps
1. Create a Firebase project.
2. Go to **Authentication → Sign-in method → Google** and enable it.
3. Go to **Authentication → Settings → Authorized domains** and add your Vercel domain (e.g. `your-app.vercel.app`) once deployed.
4. Register a **Web app** under Project Settings to get the `NEXT_PUBLIC_FIREBASE_*` values.
5. Generate a service account key (Project Settings → Service Accounts) for `FIREBASE_SERVICE_ACCOUNT_KEY`.

### MongoDB setup steps
1. Create a free cluster on Atlas.
2. Create a database user and allow network access from `0.0.0.0/0` (or Vercel's IP ranges).
3. Copy the connection string into `MONGODB_URI`. The database name (e.g. `asf-shopee`) can be anything — Mongoose will create it automatically.

### Cloudinary setup steps
1. Create a free account.
2. Copy Cloud Name, API Key, and API Secret from the dashboard home page.

---

## 3. Local Development

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Visit `http://localhost:3000`.

### Seed sample products (optional)
```bash
npm run seed
```
This inserts 8 sample grocery products so the storefront isn't empty. You can also add products directly from `/admin` once you've signed in with an email listed in `ADMIN_EMAILS`.

---

## 4. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repository.
3. Framework preset: **Next.js** (auto-detected).
4. Add all environment variables listed above under **Settings → Environment Variables** (for Production, Preview, and Development).
5. Deploy.
6. After the first deploy, add your Vercel domain to Firebase **Authorized domains** (Authentication → Settings) or Google Sign-In will fail.
7. Visit `/admin` while signed in with an account listed in `ADMIN_EMAILS` to add real products.

---

## 5. Project Structure

```
src/
  app/
    page.tsx                 storefront (home)
    products/[id]/page.tsx    product detail
    cart/page.tsx             cart
    checkout/page.tsx         checkout (requires phone + address on profile)
    onboarding/page.tsx        phone → address → map pin (no OTP)
    orders/[id]/page.tsx      live order tracking
    admin/page.tsx            admin dashboard (products + orders)
    api/                      REST API routes (products, orders, users, upload, admin)
  components/                 Navbar, ProductCard, AuthContext, CartContext, LocationMap, SplashGate
  lib/                         mongodb, firebaseAdmin, firebaseClient, cloudinary, auth helpers, Mongoose models
scripts/seed.ts                sample data seeding script
```

## 6. Notes on scope

This repository focuses on the **ASF Shopee** customer experience with an integrated **Admin** area (covering the "ASF Products" and "ASF Admin" responsibilities from the original brief) so the whole ecosystem deploys as one Vercel project with one set of environment variables. The data models (`Product`, `Order`, `User`) are structured so the admin surface can be split into its own Next.js app later if desired — it would reuse the same MongoDB, Firebase, and Cloudinary credentials.
