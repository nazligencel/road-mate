import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                setIsDarkMode(parsed.darkMode ?? true);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async (value) => {
        setIsDarkMode(value);
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            const parsed = settings ? JSON.parse(settings) : {};
            parsed.darkMode = value;
            await AsyncStorage.setItem('appSettings', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
