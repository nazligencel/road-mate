import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors, getColors } from '../constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
// Dynamic GoogleSignin import moved inside useEffect

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    useEffect(() => {
        setIsMounted(true);
        // Initialize Google Sign-In with Error Handling (Dynamic Import)
        try {
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            GoogleSignin.configure({
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true
            });
        } catch (error) {
            console.log("Google Signin logic skipped (native module not found).");
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const inTabsGroup = segments[0] === '(tabs)';

                if (!token && inTabsGroup) {
                    // No token, but trying to access tabs -> Redirect to Login
                    router.replace('/');
                } else if (token && segments[0] === undefined) {
                    // Token exists, but on Login screen -> Redirect to Home
                    // Optional: You can enable this if you want auto-login
                    // router.replace('/(tabs)/home');
                }
            } catch (e) {
                console.error("Auth Check Error", e);
            }
        };

        checkAuth();
    }, [segments, isMounted]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider style={{ backgroundColor: colors.background }}>
                <StatusBar style={isDarkMode ? "light" : "dark"} />
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.background,
                        },
                        headerTintColor: colors.text,
                        headerShadowVisible: false,
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        contentStyle: {
                            backgroundColor: colors.background,
                        },
                        animation: 'fade',
                    }}
                >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="signup" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutNav />
        </ThemeProvider>
    );
}
