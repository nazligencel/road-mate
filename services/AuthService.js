import { BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
    async googleLogin(token) {
        try {
            console.log("Sending Google token to backend:", token.substring(0, 20) + "...");
            const response = await fetch(`${BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error("Google Login Error Data:", data);
                throw new Error(data.message || 'Google login failed');
            }

            // Save token
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data));
            }

            return data;
        } catch (error) {
            console.error('AuthService Google Login Error:', error);
            throw error;
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data));
            }

            return data;
        } catch (error) {
            console.error('AuthService Login Error:', error);
            throw error;
        }
    },

    async register(name, email, password) {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data));
            }

            return data;
        } catch (error) {
            console.error('AuthService Register Error:', error);
            throw error;
        }
    },

    async logout() {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    },

    async testLogin() {
        try {
            const response = await fetch(`${BASE_URL}/auth/test-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Test login failed');
            }

            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data));
            }

            return data;
        } catch (error) {
            console.error('AuthService Test Login Error:', error);
            throw error;
        }
    }
};
