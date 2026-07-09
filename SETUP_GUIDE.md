# ASF Shopee — Detailed Credential & Setup Guide

This guide answers the exact setup questions that come up when wiring
Firebase + Google Sign-In + Push Notifications + Maps + Razorpay for the
three Expo apps and the website. Read this alongside the main `README.md`.

---

## 1. Do you need the SHA-1 / SHA-256 fingerprint?

**Yes — required for Google Sign-In to work on Android**, and recommended for
Google Maps API key restrictions. Firebase Phone Auth is not used here (you
use Google Sign-In), but Android's Google Sign-In flow verifies your app's
signing certificate against the fingerprint you register in Firebase.

### Where to get the fingerprint

**During development (Expo Go / debug builds):**
```bash
cd customer-app
eas credentials
# Select: Android -> select a build profile (e.g. "development") -> "Keystore: Manage everything needed to build your project"
# It will print the SHA-1 and SHA-256 of the managed keystore
```
Or, if you use a local debug keystore:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For production builds (EAS Build):**
```bash
eas build -p android --profile production
# after first build, run:
eas credentials
# it shows the SHA-1/SHA-256 of the keystore EAS generated/uses for you
```

### Where to add it
1. Firebase Console → Project Settings → Your apps → Android app → **Add fingerprint**.
2. Paste both SHA-1 and SHA-256 (add SHA-256 too — some Google APIs need it).
3. Repeat for **each** Android app you register (customer-app, admin-app,
   shop-owner-app each need their own Firebase "Android app" entry, since
   they have different `package` names in `app.json`, e.g.
   `com.asfshopee.customer`, `com.asfshopee.admin`, `com.asfshopee.shopowner`).
4. Download the updated `google-services.json` **after** adding the
   fingerprint (it embeds the fingerprint data) — see next section.

> iOS does not use SHA fingerprints — Google Sign-In on iOS is verified via
> the `GoogleService-Info.plist` + URL scheme instead (see section 3).

---

## 2. Do you need `google-services.json`? Where does it go?

**Yes, one per Android app** (customer-app, admin-app, shop-owner-app — each
has its own Firebase Android app registration and its own file).

### How to get it
1. Firebase Console → Project Settings → Your apps.
2. If the Android app isn't registered yet: **Add app → Android**, enter the
   package name that matches `app.json` → `expo.android.package`
   (e.g. `com.asfshopee.customer`).
3. Add the SHA-1/SHA-256 fingerprint from section 1 (can also be added later).
4. Click **Download `google-services.json`**.

### Where to place it
Put the file at the **root of each Expo app** (next to `app.json`, `package.json`):
```
customer-app/google-services.json
admin-app/google-services.json
shop-owner-app/google-services.json
```
Then reference it in each app's `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.asfshopee.customer",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### iOS equivalent
Download `GoogleService-Info.plist` the same way (Add app → iOS, using the
`bundleIdentifier` from `app.json`), place it at the app root, and reference it:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.asfshopee.customer",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

**Important:** `google-services.json` / `GoogleService-Info.plist` only take
effect in **EAS Build / prebuild** (native builds). They do **not** work in
plain Expo Go. To test push notifications and Google Sign-In fully, you need
a development build:
```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```

---

## 3. Why won't Expo push notifications work, and how to fix it

Expo push notifications route through **Expo's push service**, which in turn
uses **FCM (Android)** and **APNs (iOS)** under the hood. Common reasons it
fails and the fix:

| Problem | Fix |
|---|---|
| Testing in Expo Go | Expo Go can only receive push tokens for Expo's own dev project, not your production FCM credentials. Use a **development build** (`eas build --profile development`) once you add `google-services.json`. |
| Missing `google-services.json` | Required for Android — without it, FCM has no credentials to deliver messages. Add it per section 2. |
| Missing FCM Server Key / project link in Expo | Go to `expo.dev` → your project → **Project settings → Credentials → Android → FCM V1 service account**. Upload the **same Firebase service account JSON** you generated for the backend (Firebase Console → Project Settings → Service accounts → Generate new private key). This lets Expo's push service send through your Firebase project. |
| iOS push not working | Requires an **APNs key** (`.p8`) from your Apple Developer account (Certificates, Identifiers & Profiles → Keys → create a key with "Apple Push Notifications service" enabled). Upload it via `eas credentials` → iOS → Push Notifications. |
| Notifications work in dev build but not standalone/production app | Make sure the production build also uses the same `google-services.json`/APNs key — rebuild after adding credentials. |

### Step-by-step to make push notifications work
1. Firebase Console → generate/download the **service account JSON** (same
   one used for `FIREBASE_SERVICE_ACCOUNT_BASE64` in the backend `.env`).
2. Go to https://expo.dev → select your project → **Configuration →
   Credentials** → Android → "FCM V1 Service Account Key" → upload that JSON.
3. Add `google-services.json` to each Android app (section 2).
4. For iOS: create an APNs Auth Key in the Apple Developer portal and upload
   it the same way under iOS credentials.
5. Build a **development client** or production build with EAS — do not
   expect FCM/APNs push to work inside plain Expo Go.
6. Test with the Expo push tool: https://expo.dev/notifications — paste the
   token logged by `registerForPushNotifications()` (see
   `customer-app/lib/notifications.ts`) and send a test push.

---

## 4. What goes in the `assets/` folder of each app

Each Expo app (`customer-app`, `admin-app`, `shop-owner-app`) has this
structure — **replace every placeholder with your real branded files**:

```
assets/
├── images/
│   ├── logo.png         1024x1024 app icon (used for app.json "icon")
│   ├── logo_dark.png    dark-mode variant of the logo (used in-app, e.g. splash/header)
│   └── splash.png       1284x2778 (or 1242x2436) splash screen image, transparent/centered logo on #101214 background
├── maps/
│   └── marker.png       small PNG (e.g. 64x64) custom pin icon for the delivery/map markers
├── animations/
│   ├── success.json     Lottie animation for "Order Placed" success screen (get free ones from lottiefiles.com, search "success check")
│   ├── delivery.json    Lottie animation for delivery/loading states (search "delivery scooter" or "bike")
│   └── loading.json     Lottie animation for generic loading/splash states (search "loading spinner")
└── fonts/
    ├── Poppins-Regular.ttf
    └── Poppins-Bold.ttf
```

### Where to get each asset
- **logo.png / logo_dark.png / splash.png** — export from your brand's Figma
  file, or generate a placeholder quickly with any AI image tool / Canva.
  Icon must be square (1024x1024), no transparency issues for Android
  adaptive icons.
- **marker.png** — a simple copper (`#B87333`) pin/scooter icon; you can
  export an SVG-to-PNG from [Flaticon](https://www.flaticon.com) or
  [Icons8](https://icons8.com) (search "delivery pin").
- **Lottie JSON files** — free at [lottiefiles.com](https://lottiefiles.com):
  search "success checkmark", "delivery bike", "loading dots" → download the
  `.json` (not the `.gif`/`.mp4`) → drop into `assets/animations/`.
- **Poppins fonts** — free on [Google Fonts](https://fonts.google.com/specimen/Poppins):
  download the family ZIP, extract `Poppins-Regular.ttf` and `Poppins-Bold.ttf`.

### Load the fonts in code (already wired for you to fill in)
```ts
import { useFonts } from "expo-font";

const [loaded] = useFonts({
  "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
  "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
});
```

### Play the Lottie success animation (order placed screen)
```tsx
import LottieView from "lottie-react-native";
<LottieView source={require("../assets/animations/success.json")} autoPlay loop={false} style={{ width: 200, height: 200 }} />
```

---

## 5. How to get a Razorpay key (Key ID + Key Secret)

1. Sign up at https://dashboard.razorpay.com/signup.
2. Once logged in, you start in **Test Mode** (top-right toggle) — good for
   development, no real money moves.
3. Go to **Settings → API Keys → Generate Test Key**. This gives you:
   - `Key ID` (starts with `rzp_test_...`)
   - `Key Secret` (shown once — copy immediately)
4. Put these into:
   - `backend/.env` → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `website/.env.local` → `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Key ID only —
     never expose the Secret to the frontend)
5. Test payments using Razorpay's [test card/UPI numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   (e.g. UPI: `success@razorpay`, card `4111 1111 1111 1111`).
6. **Going live:** complete KYC/business verification in the Razorpay
   dashboard (Settings → Account & Settings → Activate Account). Once
   approved, switch to **Live Mode** and generate live keys
   (`rzp_live_...`) — replace the test keys in your env vars with these.
7. No code changes needed to go live — same `create-order` / `verify` routes
   in `backend/src/routes/payments.js` work for both test and live keys.

---

## 6. How to get a Google Maps API key

Needed for: address map picker (customer app), live delivery tracking map,
and the website's location features.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or reuse your Firebase project — they share the same
   underlying GCP project).
3. Go to **APIs & Services → Library** and enable:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Maps JavaScript API** (for the website, if you add a map there)
   - **Geocoding API** (to convert lat/lng ↔ address)
   - **Places API** (optional, for address autocomplete)
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
5. **Restrict the key** (important for security):
   - For the **Android** key: restriction type = Android apps → add each
     package name (`com.asfshopee.customer`, etc.) + the SHA-1 fingerprint
     from section 1.
   - For the **iOS** key: restriction type = iOS apps → add each bundle ID.
   - For the **website** key: restriction type = HTTP referrers → add your
     domain (e.g. `https://yourdomain.com/*`).
   - It's fine (and simpler for testing) to create **3 separate keys**
     (Android, iOS, Web) each restricted to its own platform, or one
     unrestricted key while developing — just restrict before going live.
6. Enable **billing** on the GCP project (Google Maps requires a linked
   billing account even though there's a generous free monthly credit).
7. Place the keys:
   - `customer-app/app.json` → `android.config.googleMaps.apiKey` and
     `ios.config.googleMapsApiKey`
   - `website/.env.local` → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 7. Quick checklist before your first real device test

- [ ] Firebase project created, Auth (Google) + Firestore + Cloud Messaging enabled
- [ ] Android app registered per Expo app with correct `package` name
- [ ] SHA-1 + SHA-256 fingerprint added to each Firebase Android app
- [ ] `google-services.json` downloaded per app and placed at each app root
- [ ] iOS app registered, `GoogleService-Info.plist` placed at each app root
- [ ] Firebase service account JSON uploaded to Expo (expo.dev → Credentials → FCM V1)
- [ ] APNs key uploaded for iOS push (if targeting iOS)
- [ ] `assets/images`, `assets/maps`, `assets/animations`, `assets/fonts` populated with real files
- [ ] Google Maps API key created, restricted, billing enabled, and added to `app.json` + website env
- [ ] Razorpay test keys added to backend `.env` and website `.env.local`
- [ ] Backend deployed to Render with all env vars filled in
- [ ] Each Expo app has a real `.env` (copied from `.env.example`) with Firebase, API, Maps, Razorpay values filled in
- [ ] Same values mirrored as `eas secret:create` entries before running `eas build`
- [ ] Built a **development build** (`eas build --profile development`) — not just Expo Go — to test Google Sign-In and push notifications end-to-end

---

Once all of the above are in place, run:
```bash
eas build --profile development --platform android
```
Install the resulting `.apk` on a real device (Expo Go will NOT work for
Google Sign-In or push notifications), sign in with Google, and check that a
push token is logged — then send yourself a test notification from
https://expo.dev/notifications to confirm delivery.
