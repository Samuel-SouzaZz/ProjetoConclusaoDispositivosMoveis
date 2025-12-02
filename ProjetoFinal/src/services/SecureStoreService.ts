import * as SecureStore from "expo-secure-store";

export async function saveSecure(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export async function getSecure(key: string) {
    return await SecureStore.getItemAsync(key);
}

export async function deleteSecure(key: string) {
    await SecureStore.deleteItemAsync(key);
}