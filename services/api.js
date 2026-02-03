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
    return `http://${ip}:5000`;
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

// Places Service - Calls backend which proxies to Google Places API (API key stays secure on server)
export const PlacesService = {
    async getNearbyPlaces(lat, lng, category, radius = 5000) {
        try {
            const url = `${BASE_URL}/api/places/nearby?lat=${lat}&lng=${lng}&category=${category}&radius=${radius}`;
            console.log('📍 Fetching places from backend:', category);

            const response = await fetch(url);
            if (!response.ok) {
                console.error(`❌ Places fetch failed (${response.status})`);
                return [];
            }

            const places = await response.json();
            console.log(`✅ Received ${places.length} ${category} from backend`);
            return places;
        } catch (error) {
            console.error('Error fetching places from backend:', error);
            return [];
        }
    }
};

// Connection Service - QR bağlantı sistemi
export const ConnectionService = {
    /**
     * QR tarandığında bağlantı isteği gönder
     */
    async connectByQR(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/scan/${targetUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('❌ QR Connection Failed:', data.message);
                return { success: false, message: data.message };
            }

            console.log('✅ QR Connection Success:', data);
            return data;
        } catch (error) {
            console.error('Error connecting by QR:', error);
            return { success: false, message: 'Bağlantı hatası' };
        }
    },

    /**
     * Kullanıcının bağlantılarını getir
     */
    async getMyConnections(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Get Connections Failed');
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting connections:', error);
            return [];
        }
    },

    /**
     * Bekleyen bağlantı isteklerini getir
     */
    async getPendingRequests(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Get Pending Failed');
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting pending requests:', error);
            return [];
        }
    },

    /**
     * Bağlantı sayısını getir
     */
    async getConnectionCount(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return { count: 0 };
            return await response.json();
        } catch (error) {
            console.error('Error getting connection count:', error);
            return { count: 0 };
        }
    },

    /**
     * Bağlantı isteğini kabul et
     */
    async acceptConnection(connectionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/${connectionId}/accept`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error accepting connection:', error);
            return { success: false };
        }
    },

    /**
     * Bağlantı isteğini reddet
     */
    async rejectConnection(connectionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/${connectionId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error rejecting connection:', error);
            return { success: false };
        }
    }
};
