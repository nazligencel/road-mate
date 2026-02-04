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
import { Colors } from '../constants/Colors';
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
    Globe
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Standard Switch to match Profile theme colors
const CustomSwitch = ({ value, onValueChange }) => (
    <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.primary }}
        thumbColor="#FFF"
    />
);

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
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

    const Section = ({ title, children, style }) => (
        <View style={[styles.sectionContainer, style]}>
            {title && <Text style={styles.sectionHeader}>{title}</Text>}
            <View style={styles.cardContainer}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.cardContent}>
                    {children}
                </View>
            </View>
        </View>
    );

    const MenuItem = ({ icon: Icon, label, value, onPress, isLast, showChevron = true, type = 'link', onToggle, toggleValue }) => (
        <TouchableOpacity
            activeOpacity={type === 'toggle' ? 1 : 0.7}
            onPress={type === 'toggle' ? () => onToggle(!toggleValue) : onPress}
            style={[styles.menuItem, !isLast && styles.menuItemBorder]}
        >
            <View style={styles.menuLeft}>
                {Icon && <Icon size={20} color={Colors.textSecondary} style={{ marginRight: 12 }} />}
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {type === 'toggle' ? (
                    <CustomSwitch value={toggleValue} onValueChange={onToggle} />
                ) : (
                    <>
                        {value && <Text style={styles.menuValue}>{value}</Text>}
                        {showChevron && <ChevronRight size={16} color={Colors.textSecondary} />}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[Colors.background, '#1e293b', Colors.background]}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Account Section */}
                <Section title="Account">
                    <TouchableOpacity style={styles.accountRow} onPress={() => { }}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'AR'}
                            </Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={styles.accountName}>{userData?.name || 'Road Mate User'}</Text>
                            <Text style={styles.accountEmail}>{userData?.email || 'user@roadmate.com'}</Text>
                        </View>
                        <View style={styles.editProfileBtn}>
                            <Text style={styles.editProfileText}>Edit</Text>
                            <ChevronRight size={14} color={Colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </Section>

                {/* Preferences Section */}
                <Section title="Preferences">
                    <MenuItem
                        icon={Bell}
                        label="Notifications"
                        type="toggle"
                        toggleValue={notifications}
                        onToggle={setNotifications}
                    />
                    <MenuItem
                        icon={Moon}
                        label="Dark Mode"
                        type="toggle"
                        toggleValue={isDarkMode}
                        onToggle={toggleTheme}
                    />
                    <MenuItem
                        icon={MapPin}
                        label="Location Services"
                        type="toggle"
                        toggleValue={locationServices}
                        onToggle={setLocationServices}
                    />
                    <MenuItem
                        icon={Globe}
                        label="Language"
                        value="English"
                        isLast
                    />
                </Section>

                {/* Vehicle Section */}
                <Section title="Vehicle">
                    <View style={styles.vehicleRow}>
                        <Car size={24} color={Colors.primary} style={styles.vehicleIcon} />
                        <View>
                            <Text style={styles.menuLabel}>My Vehicle</Text>
                            <Text style={styles.menuSubLabel}>{userData?.vehicle || 'Mercedes Sprinter'}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <MenuItem
                        label="Edit vehicle info"
                        isLast
                    />
                </Section>

                {/* Privacy & About Grid */}
                <View style={styles.gridRow}>
                    <Section title="Privacy & Security" style={styles.gridItem}>
                        <TouchableOpacity style={styles.smallMenuItem}>
                            <Lock size={16} color={Colors.textSecondary} />
                            <Text style={styles.smallMenuLabel}>Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallMenuItem}>
                            <UserX size={16} color={Colors.textSecondary} />
                            <Text style={styles.smallMenuLabel}>Blocked Users</Text>
                            <ChevronRight size={12} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallMenuItem, { borderBottomWidth: 0 }]}>
                            <Trash2 size={16} color={Colors.error} />
                            <Text style={[styles.smallMenuLabel, { color: Colors.error }]}>Delete Account</Text>
                        </TouchableOpacity>
                    </Section>

                    <Section title="About" style={styles.gridItem}>
                        <TouchableOpacity style={styles.smallMenuItem}>
                            <FileText size={16} color={Colors.textSecondary} />
                            <Text style={styles.smallMenuLabel}>Terms</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallMenuItem}>
                            <Shield size={16} color={Colors.textSecondary} />
                            <Text style={styles.smallMenuLabel}>Privacy</Text>
                        </TouchableOpacity>
                        <View style={[styles.smallMenuItem, { borderBottomWidth: 0, justifyContent: 'space-between' }]}>
                            <Text style={styles.smallMenuLabel}>Version</Text>
                            <Text style={styles.versionText}>1.0.0</Text>
                        </View>
                    </Section>
                </View>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={styles.logoutButton}>
                    <LogOut size={20} color={Colors.error} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
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
        color: Colors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.05)',
        }),
    },
    cardContent: {
        // Wrapper for content inside blur view
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 15,
        color: Colors.text,
        fontWeight: '500',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 14,
        color: Colors.textSecondary,
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
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarText: {
        color: Colors.text,
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
        color: Colors.text,
    },
    accountEmail: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editProfileText: {
        fontSize: 13,
        color: Colors.primary,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    vehicleIcon: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
    },
    menuSubLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
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
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    smallMenuLabel: {
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    versionText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        paddingVertical: 16,
    },
    logoutText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
