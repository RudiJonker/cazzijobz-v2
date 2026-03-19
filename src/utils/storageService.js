import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: 'cazzijobz_user_profile',
};

export const storageService = {
  setUserProfile: async (profile) => {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },
  getUserProfile: async () => {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },
  clearUserProfile: async () => {
    await AsyncStorage.removeItem(KEYS.USER_PROFILE);
  },
};