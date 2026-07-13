import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "delivery_token";
const PARTNER_KEY = "delivery_partner";

export async function saveAuth(token: string, partner: any) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(PARTNER_KEY, JSON.stringify(partner));
}

export async function getAuth() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const partnerStr = await AsyncStorage.getItem(PARTNER_KEY);
  return { token, partner: partnerStr ? JSON.parse(partnerStr) : null };
}

export async function clearAuth() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(PARTNER_KEY);
}
