import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Detect API URL based on environment
// For Android Emulator, use 10.0.2.2
// For Genymotion, use 10.0.3.2
// For iOS Simulator, use localhost
// For Physical Device, use your LAN IP (e.g., 192.168.1.x)

const DEV_API_URL = Platform.select({
    android: 'http://10.0.2.2:3001/api',
    ios: 'http://localhost:3001/api',
    default: 'http://10.0.2.2:3001/api' // Default fallback
});

// Create Axios Instance
const api = axios.create({
    baseURL: DEV_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Token
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching token', error);
    }
    return config;
});

export default api;
