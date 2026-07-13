import Constants from "expo-constants";
const extra = Constants.expoConfig?.extra || {};
export const API_URL = extra.apiUrl || "https://asf-api-five.vercel.app";
