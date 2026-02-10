import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors, getColors } from '../constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { DiscussionProvider } from '../contexts/DiscussionContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
let Notifications;
let registerForPushNotificationsAsync;
try {
    Notifications = require('expo-notifications');
    const notifUtils = require('../utils/notifications');
    registerForPushNotificationsAsync = notifUtils.registerForPushNotificationsAsync;
} catch (e) {
    console.log('Notifications module not available:', e.message);
}
// Dynamic GoogleSignin import moved inside useEffect

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { notifications: notificationsEnabled } = useSettings();
    const notificationListener = useRef();
    const responseListener = useRef();

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

    // Push notification registration
    useEffect(() => {
        if (!isMounted || !notificationsEnabled || !Notifications) return;

        const setupNotifications = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token && registerForPushNotificationsAsync) {
                    await registerForPushNotificationsAsync(token);
                }
            } catch (e) {
                console.log('Push notification setup skipped:', e.message);
            }
        };

        setupNotifications();

        // Listener for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        // Listener for when user taps on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.type === 'SOS' && data?.lat && data?.lng) {
                router.push({
                    pathname: '/(tabs)/explore',
                    params: { focusLat: data.lat, focusLng: data.lng }
                });
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isMounted, notificationsEnabled]);

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
                    <Stack.Screen name="settings" options={{ headerShown: false }} />
                    <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                    <Stack.Screen name="vehicle-info" options={{ headerShown: false }} />
                    <Stack.Screen name="blocked-users" options={{ headerShown: false }} />
                    <Stack.Screen name="edit-activity" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <SettingsProvider>
                <SubscriptionProvider>
                    <DiscussionProvider>
                        <RootLayoutNav />
                    </DiscussionProvider>
                </SubscriptionProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}
