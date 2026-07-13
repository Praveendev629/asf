import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "admin_email";
export async function saveAdminEmail(email: string) { await AsyncStorage.setItem(KEY, email); }
export async function getAdminEmail() { return AsyncStorage.getItem(KEY); }
export async function clearAdmin() { await AsyncStorage.removeItem(KEY); }
