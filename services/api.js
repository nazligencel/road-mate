import Constants from 'expo-constants';
import { Platform } from 'react-native';


const getApiUrl = () => {
    // 1. Get the IP address of the machine running the Expo server
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

    // 2. Determine base URL based on platform
    let ip = localhost;

    // Android Emulator special IP
    if (Platform.OS === 'android' && (ip === 'localhost' || ip === '127.0.0.1')) {
        ip = '10.0.2.2';
    }

    // 3. Return full URL with Java Spring Boot Port (5000)
    return `http://${ip}:8080`;
};

export const BASE_URL = getApiUrl();
console.log('📡 BASE URL set to:', BASE_URL);

export const NomadService = {
    async getNearbyNomads(lat, lng) {
        try {
            const response = await fetch(`${BASE_URL}/api/nearby-nomads?lat=${lat}&lng=${lng}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Fetch Nomads Failed (${response.status}):`, errorData);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching nomads:', error);
            return [];
        }
    },

    async updateLocation(userId, lat, lng) {
        try {
            const response = await fetch(`${BASE_URL}/api/update-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, latitude: lat, longitude: lng }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Update Location Failed (${response.status}):`, errorData);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false };
        }
    }
};
