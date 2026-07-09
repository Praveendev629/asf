require("dotenv/config"); // loads .env into process.env for local `expo start`

// For EAS builds, set the same variable names as EAS Secrets instead of a
// committed .env file: `eas secret:create --name GOOGLE_MAPS_API_KEY --value ...`
export default {
  expo: {
    name: "ASF Shopee",
    slug: "asf-shopee-customer",
    scheme: "asfshopee",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    splash: {
      image: "./assets/images/splash.png",
      backgroundColor: "#101214",
    },
    userInterfaceStyle: "dark",
    plugins: ["expo-router", "expo-location", "expo-notifications"],
    android: {
      package: "com.asfshopee.customer",
      googleServicesFile: "./google-services.json",
      config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } },
    },
    ios: {
      bundleIdentifier: "com.asfshopee.customer",
      googleServicesFile: "./GoogleService-Info.plist",
      config: { googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      apiBaseUrl: process.env.API_BASE_URL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      eas: { projectId: process.env.EAS_PROJECT_ID },
    },
  },
};
