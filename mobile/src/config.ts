import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};

export const API_URL = extra.apiUrl || process.env.EXPO_PUBLIC_API_URL || "https://your-api-app.vercel.app";
export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId || process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || "";
export const GOOGLE_ANDROID_CLIENT_ID = extra.googleAndroidClientId || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";
export const GOOGLE_IOS_CLIENT_ID = extra.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";
