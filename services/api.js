const API_URL = 'http://localhost:5000/api'; // Update this with your machine IP for physical device testing

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
