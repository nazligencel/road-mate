const API_URL = 'http://192.168.1.104:5000/api'; // Updated with local IP for physical device testing

export const NomadService = {
    async getNearbyNomads(lat, lng) {
        try {
            const response = await fetch(`${API_URL}/nearby-nomads?lat=${lat}&lng=${lng}`);
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
            return await response.json();
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false };
        }
    }
};
