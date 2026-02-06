import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getColors } from '../constants/Colors';
import { router } from 'expo-router';
import { Crown, Map, Route, Bot, AlertTriangle, Check, X, ArrowLeft } from 'lucide-react-native';

const PRO_FEATURES = [
    {
        icon: Map,
        title: 'Unlimited Range',
        description: 'See all nomads on the map, no distance limits',
        color: '#3B82F6',
    },
    {
        icon: Route,
        title: 'View Routes',
        description: "See other travelers' routes and destinations",
        color: '#10B981',
    },
    {
        icon: Bot,
        title: 'AI Road Assistant',
        description: 'Get instant help with routes, vehicle issues & more',
        color: '#8B5CF6',
    },
    {
        icon: AlertTriangle,
        title: 'SOS Alert',
        description: 'Send instant roadside help requests to nearby users',
        color: '#EF4444',
    },
];

export default function PaywallScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { purchasePro, restorePurchases, offerings, isPro } = useSubscription();
    const [purchasing, setPurchasing] = useState(false);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const priceText = offerings?.availablePackages?.[0]?.product?.priceString || '$4.99/month';

    const handlePurchase = async () => {
        setPurchasing(true);
        const success = await purchasePro();
        setPurchasing(false);
        if (success) {
            router.back();
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        const success = await restorePurchases();
        setPurchasing(false);
        if (success) {
            router.back();
        }
    };

    if (isPro) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#C5A059', colors.background]}
                    style={[StyleSheet.absoluteFill, { height: 400 }]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.6}
                />
                <View style={styles.alreadyPro}>
                    <Crown color="#C5A059" size={64} />
                    <Text style={styles.alreadyProTitle}>You're already Pro!</Text>
                    <Text style={styles.alreadyProSubtitle}>Enjoy all premium features</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#C5A059', colors.background]}
                style={[StyleSheet.absoluteFill, { height: 450 }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                opacity={0.5}
            />

            {/* Back button */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.crownContainer}>
                        <LinearGradient
                            colors={['#C5A059', '#E8C66A']}
                            style={styles.crownGradient}
                        >
                            <Crown color="#FFF" size={36} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Upgrade to Pro</Text>
                    <Text style={styles.subtitle}>Unlock the full RoadMate experience</Text>
                </View>

                {/* Features list */}
                <View style={styles.featuresContainer}>
                    {PRO_FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                                <feature.icon color={feature.color} size={22} />
                            </View>
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                            <Check color={colors.success} size={20} />
                        </View>
                    ))}
                </View>

                {/* Pricing */}
                <View style={styles.pricingContainer}>
                    <View style={styles.pricingCard}>
                        <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={styles.pricingContent}>
                            <Text style={styles.priceLabel}>Monthly</Text>
                            <Text style={styles.priceAmount}>{priceText}</Text>
                            <Text style={styles.priceSub}>Cancel anytime</Text>
                        </View>
                    </View>
                </View>

                {/* Purchase button */}
                <TouchableOpacity
                    style={styles.purchaseBtn}
                    onPress={handlePurchase}
                    disabled={purchasing}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#C5A059', '#E8C66A']}
                        style={styles.purchaseBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {purchasing ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.purchaseBtnText}>Subscribe Now</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Restore */}
                <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={purchasing}>
                    <Text style={styles.restoreBtnText}>Restore Purchases</Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                    Subscription auto-renews monthly. Cancel anytime in your device settings.
                </Text>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    closeBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    crownContainer: {
        marginBottom: 16,
        shadowColor: '#C5A059',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    crownGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    featuresContainer: {
        gap: 16,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    featureDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    pricingContainer: {
        marginBottom: 24,
    },
    pricingCard: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#C5A059',
        overflow: 'hidden',
    },
    pricingContent: {
        padding: 20,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.text,
        marginVertical: 4,
    },
    priceSub: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    purchaseBtn: {
        marginBottom: 16,
        shadowColor: '#C5A059',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    purchaseBtnGradient: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    purchaseBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    restoreBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    restoreBtnText: {
        fontSize: 14,
        color: colors.textSecondary,
        textDecorationLine: 'underline',
    },
    legalText: {
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.7,
    },
    alreadyPro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    alreadyProTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 20,
    },
    alreadyProSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
    },
    backBtn: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    backBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
