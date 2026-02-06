import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Image,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    ChevronRight,
    Bell,
    Moon,
    MapPin,
    Car,
    Lock,
    UserX,
    Trash2,
    FileText,
    Shield,
    LogOut,
    Globe,
    Crown
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../contexts/SubscriptionContext';

const { width } = Dimensions.get('window');

// Move components outside to prevent recreation on render
const CustomSwitch = ({ value, onValueChange, trackColor, thumbColor }) => (
    <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor}
        thumbColor={thumbColor}
    />
);

const Section = ({ title, children, style, colors, isDarkMode }) => (
    <View style={[styles.sectionContainer, style]}>
        {title && <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>}
        <View style={[styles.cardContainer, {
            borderColor: colors.cardBorder,
            backgroundColor: isDarkMode
                ? Platform.select({ ios: 'transparent', android: 'rgba(255, 255, 255, 0.05)' })
                : colors.card
        }]}>
            {isDarkMode && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
            <View style={styles.cardContent}>
                {children}
            </View>
        </View>
    </View>
);

const MenuItem = ({ icon: Icon, label, value, onPress, isLast, showChevron = true, type = 'link', onToggle, toggleValue, colors, isDarkMode }) => (
    <View
        style={[
            styles.menuItem,
            !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
        ]}
    >
        <TouchableOpacity
            activeOpacity={type === 'toggle' ? 1 : 0.7}
            onPress={type === 'toggle' ? null : onPress}
            style={styles.menuItemInner}
        >
            <View style={styles.menuLeft}>
                {Icon && <Icon size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />}
                <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {type === 'toggle' ? (
                    <CustomSwitch
                        value={toggleValue}
                        onValueChange={onToggle}
                        trackColor={{
                            false: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            true: colors.primary
                        }}
                        thumbColor="#FFF"
                    />
                ) : (
                    <>
                        {value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>}
                        {showChevron && <ChevronRight size={16} color={colors.textSecondary} />}
                    </>
                )}
            </View>
        </TouchableOpacity>
    </View>
);

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro, restorePurchases } = useSubscription();
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState(true);
    const [locationServices, setLocationServices] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (userDataStr) {
                setUserData(JSON.parse(userDataStr));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('userToken');
                    router.replace('/login');
                }
            }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background Gradient - Dark mode only */}
            {/* Top Gradient Glow matching Profile */}
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>
            {/* Main Background */}
            <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Account Section */}
                <Section title="Account" colors={colors} isDarkMode={isDarkMode}>
                    <View style={styles.accountRow}>
                        <View style={[styles.avatarPlaceholder, {
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.primary + '20',
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : colors.primary + '40'
                        }]}>
                            <Text style={[styles.avatarText, { color: isDarkMode ? colors.text : colors.primary }]}>
                                {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'AR'}
                            </Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={[styles.accountName, { color: colors.text }]}>{userData?.name || 'Road Mate User'}</Text>
                            <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>{userData?.email || 'user@roadmate.com'}</Text>
                        </View>
                    </View>
                </Section>

                {/* Subscription Section */}
                <Section title="Subscription" colors={colors} isDarkMode={isDarkMode}>
                    <View style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 18,
                                    backgroundColor: isPro ? '#C5A05920' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                    justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <Crown size={18} color={isPro ? '#C5A059' : colors.textSecondary} />
                                </View>
                                <View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                                        {isPro ? 'RoadMate Pro' : 'Free Plan'}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                                        {isPro ? 'All features unlocked' : 'Limited features'}
                                    </Text>
                                </View>
                            </View>
                            {isPro && (
                                <View style={{
                                    backgroundColor: '#C5A05920', paddingHorizontal: 10, paddingVertical: 4,
                                    borderRadius: 10, borderWidth: 1, borderColor: '#C5A05940',
                                }}>
                                    <Text style={{ color: '#C5A059', fontSize: 11, fontWeight: 'bold' }}>ACTIVE</Text>
                                </View>
                            )}
                        </View>

                        {!isPro ? (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#C5A059', borderRadius: 12, paddingVertical: 12,
                                    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                                }}
                                onPress={() => router.push('/paywall')}
                            >
                                <Crown size={16} color="#FFF" />
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Upgrade to Pro</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
                                Manage your subscription in device settings
                            </Text>
                        )}

                        <TouchableOpacity
                            style={{ marginTop: 10, alignItems: 'center' }}
                            onPress={restorePurchases}
                        >
                            <Text style={{ fontSize: 13, color: colors.textSecondary, textDecorationLine: 'underline' }}>
                                Restore Purchases
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Section>

                {/* Preferences Section */}
                <Section title="Preferences" colors={colors} isDarkMode={isDarkMode}>
                    <MenuItem
                        icon={Bell}
                        label="Notifications"
                        type="toggle"
                        toggleValue={notifications}
                        onToggle={setNotifications}
                        colors={colors}
                        isDarkMode={isDarkMode}
                    />
                    <MenuItem
                        icon={Moon}
                        label="Dark Mode"
                        type="toggle"
                        toggleValue={isDarkMode}
                        onToggle={toggleTheme}
                        colors={colors}
                        isDarkMode={isDarkMode}
                    />
                    <MenuItem
                        icon={MapPin}
                        label="Location Services"
                        type="toggle"
                        toggleValue={locationServices}
                        onToggle={setLocationServices}
                        colors={colors}
                        isDarkMode={isDarkMode}
                    />
                    <MenuItem
                        icon={Globe}
                        label="Language"
                        value="English"
                        isLast
                        colors={colors}
                        isDarkMode={isDarkMode}
                    />
                </Section>

                {/* Vehicle Section */}
                <Section title="Vehicle" colors={colors} isDarkMode={isDarkMode}>
                    <View style={styles.vehicleRow}>
                        <Car size={24} color={colors.primary} style={[styles.vehicleIcon, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.primary + '10' }]} />
                        <View>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>My Vehicle</Text>
                            <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>{userData?.vehicle || 'Mercedes Sprinter'}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <MenuItem
                        label="Edit vehicle info"
                        isLast
                        colors={colors}
                        isDarkMode={isDarkMode}
                    />
                </Section>

                {/* Privacy & About Grid */}
                <View style={styles.gridRow}>
                    <Section title="Privacy & Security" style={styles.gridItem} colors={colors} isDarkMode={isDarkMode}>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomColor: colors.border }]}>
                            <Lock size={16} color={colors.textSecondary} />
                            <Text style={[styles.smallMenuLabel, { color: colors.text }]}>Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomColor: colors.border }]}>
                            <UserX size={16} color={colors.textSecondary} />
                            <Text style={[styles.smallMenuLabel, { color: colors.text }]}>Blocked Users</Text>
                            <ChevronRight size={12} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomWidth: 0 }]}>
                            <Trash2 size={16} color={colors.error} />
                            <Text style={[styles.smallMenuLabel, { color: colors.error }]}>Delete Account</Text>
                        </TouchableOpacity>
                    </Section>

                    <Section title="About" style={styles.gridItem} colors={colors} isDarkMode={isDarkMode}>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomColor: colors.border }]}>
                            <FileText size={16} color={colors.textSecondary} />
                            <Text style={[styles.smallMenuLabel, { color: colors.text }]}>Terms</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomColor: colors.border }]}>
                            <Shield size={16} color={colors.textSecondary} />
                            <Text style={[styles.smallMenuLabel, { color: colors.text }]}>Privacy</Text>
                        </TouchableOpacity>
                        <View style={[styles.smallMenuItem, { borderBottomWidth: 0, justifyContent: 'space-between' }]}>
                            <Text style={[styles.smallMenuLabel, { color: colors.text }]}>Version</Text>
                            <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
                        </View>
                    </Section>
                </View>

                {/* Logout Button */}
                {/* Logout Section */}
                <Section colors={colors} isDarkMode={isDarkMode} style={{ marginTop: 10 }}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0, justifyContent: 'center' }]}
                        onPress={handleLogout}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <LogOut size={20} color={colors.error} style={{ marginRight: 8 }} />
                            <Text style={[styles.menuLabel, { color: colors.error, marginLeft: 0 }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </Section>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardContent: {
        // Wrapper for content inside blur view
    },
    menuItem: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 14,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    accountInfo: {
        flex: 1,
        marginLeft: 12,
    },
    accountName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    accountEmail: {
        fontSize: 13,
        marginTop: 2,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editProfileText: {
        fontSize: 13,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    vehicleIcon: {
        padding: 8,
        borderRadius: 8,
    },
    menuSubLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    gridItem: {
        flex: 1,
        marginBottom: 0,
    },
    smallMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
    },
    smallMenuLabel: {
        fontSize: 13,
        flex: 1,
    },
    versionText: {
        fontSize: 13,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        paddingVertical: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
