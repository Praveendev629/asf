require("dotenv/config");

export default {
  expo: {
    name: "ASF Shopee Shop Owner",
    slug: "asf-shopee-shop-owner",
    scheme: "asfshopeeshop",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    splash: { image: "./assets/images/splash.png", backgroundColor: "#101214" },
    userInterfaceStyle: "dark",
    plugins: ["expo-router", "expo-image-picker"],
    android: {
      package: "com.asfshopee.shopowner",
      googleServicesFile: "./google-services.json",
    },
    ios: {
      bundleIdentifier: "com.asfshopee.shopowner",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      apiBaseUrl: process.env.API_BASE_URL,
      eas: { projectId: process.env.EAS_PROJECT_ID },
    },
  },
};
