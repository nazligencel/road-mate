import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { UserService } from '../services/api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync(token) {
    let pushToken;

    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('sos-alerts', {
            name: 'SOS Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#EF4444',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? 'd50310df-3620-497f-b72e-6aa5ef455a99';
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    pushToken = tokenResponse.data;

    // Register token on backend
    if (pushToken && token) {
        try {
            await UserService.registerPushToken(pushToken, token);
            console.log('Push token registered:', pushToken);
        } catch (e) {
            console.error('Failed to register push token on backend:', e);
        }
    }

    return pushToken;
}
