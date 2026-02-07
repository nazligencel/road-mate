import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { BASE_URL } from '../services/api';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const SubscriptionContext = createContext();

// ⚠️ TEST MODE: Set to true to simulate Pro user (set false for production)
const DEV_FORCE_PRO = __DEV__ ? true : false;

// RevenueCat API keys from .env
const REVENUECAT_API_KEY = Platform.OS === 'ios'
    ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '')
    : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '');

export function SubscriptionProvider({ children }) {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offerings, setOfferings] = useState(null);

    useEffect(() => {
        initializeSubscription();
    }, []);

    const initializeSubscription = async () => {
        try {
            if (DEV_FORCE_PRO) {
                console.log('[DEV] Forcing Pro mode for testing');
                setIsPro(true);
                setIsLoading(false);
                return;
            }

            if (!REVENUECAT_API_KEY) {
                console.log('RevenueCat API key not set, falling back to backend check');
                await checkBackendStatus();
                setIsLoading(false);
                return;
            }

            // Set log level for debugging (remove in production)
            Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

            // Configure RevenueCat
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

            // Check current customer info
            const customerInfo = await Purchases.getCustomerInfo();
            const hasPro = customerInfo.entitlements.active['pro'] !== undefined;
            setIsPro(hasPro);

            if (hasPro) {
                await syncWithBackend('pro');
            }

            // Load offerings
            try {
                const offeringsResult = await Purchases.getOfferings();
                if (offeringsResult.current) {
                    setOfferings(offeringsResult.current);
                }
            } catch (e) {
                console.log('Could not load offerings:', e.message);
            }
        } catch (error) {
            console.log('RevenueCat init error:', error.message);
            await checkBackendStatus();
        } finally {
            setIsLoading(false);
        }
    };

    const checkBackendStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/subscription/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setIsPro(data.isPro === true);
            }
        } catch (error) {
            console.log('Backend subscription check failed:', error.message);
        }
    };

    const syncWithBackend = async (subscriptionType) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            await fetch(`${BASE_URL}/api/subscription/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: 'roadmate_pro_monthly', subscriptionType })
            });
        } catch (error) {
            console.log('Backend sync failed:', error.message);
        }
    };

    const purchasePro = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (!offerings.current || !offerings.current.availablePackages.length) {
                Alert.alert('Not Available', 'No subscription packages available.');
                return false;
            }

            const packageToBuy = offerings.current.availablePackages[0];
            const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

            if (customerInfo.entitlements.active['pro'] !== undefined) {
                setIsPro(true);
                await syncWithBackend('pro');
                return true;
            }

            return false;
        } catch (error) {
            if (!error.userCancelled) {
                Alert.alert('Purchase Error', error.message);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            const hasPro = customerInfo.entitlements.active['pro'] !== undefined;
            setIsPro(hasPro);

            if (hasPro) {
                await syncWithBackend('pro');
                Alert.alert('Restored', 'Your Pro subscription has been restored!');
            } else {
                Alert.alert('No Subscription', 'No active subscription found to restore.');
            }

            return hasPro;
        } catch (error) {
            Alert.alert('Restore Error', error.message);
            return false;
        }
    };

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            isLoading,
            offerings,
            purchasePro,
            restorePurchases,
            checkBackendStatus,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
