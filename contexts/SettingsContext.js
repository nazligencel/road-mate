import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '../translations';

const SettingsContext = createContext();

const DEFAULTS = {
    notifications: true,
    locationServices: true,
    language: 'en',
};

export const SettingsProvider = ({ children }) => {
    const [notifications, setNotificationsState] = useState(DEFAULTS.notifications);
    const [locationServices, setLocationServicesState] = useState(DEFAULTS.locationServices);
    const [language, setLanguageState] = useState(DEFAULTS.language);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const raw = await AsyncStorage.getItem('appSettings');
            if (raw) {
                const parsed = JSON.parse(raw);
                setNotificationsState(parsed.notifications ?? DEFAULTS.notifications);
                setLocationServicesState(parsed.locationServices ?? DEFAULTS.locationServices);
                setLanguageState(parsed.language ?? DEFAULTS.language);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveSetting = async (key, value) => {
        try {
            const raw = await AsyncStorage.getItem('appSettings');
            const parsed = raw ? JSON.parse(raw) : {};
            parsed[key] = value;
            await AsyncStorage.setItem('appSettings', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    const setNotifications = useCallback((value) => {
        setNotificationsState(value);
        saveSetting('notifications', value);
    }, []);

    const setLocationServices = useCallback((value) => {
        setLocationServicesState(value);
        saveSetting('locationServices', value);
    }, []);

    const setLanguage = useCallback((value) => {
        setLanguageState(value);
        saveSetting('language', value);
    }, []);

    const t = useCallback((key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    }, [language]);

    return (
        <SettingsContext.Provider value={{
            notifications,
            setNotifications,
            locationServices,
            setLocationServices,
            language,
            setLanguage,
            t,
            isLoaded,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
