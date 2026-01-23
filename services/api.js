import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Professional IP Detection: 
// 10.0.2.2 is the special IP for Android Emulator to access host's localhost
// For physical devices, we use the debugger host's IP address
const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

    const ip = Platform.OS === 'android' && localhost === 'localhost'
        ? '10.0.2.2'
        : localhost;

    return `http://${ip}:5000/api`;
};

const API_URL = getApiUrl();
console.log('📡 API URL set to:', API_URL);

export const NomadService = {
    async getNearbyNomads(lat, lng) {
        try {
            const response = await fetch(`${API_URL}/nearby-nomads?lat=${lat}&lng=${lng}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching nomads:', error);
            return [];
        }
    },

    async updateLocation(userId, lat, lng) {
        try {
            const response = await fetch(`${API_URL}/update-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, latitude: lat, longitude: lng }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false };
        }
    }
};
