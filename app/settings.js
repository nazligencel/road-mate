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
    Linking,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import {
    ArrowLeft,
    User,
    ChevronRight,
    Bell,
    Moon,
    MapPin,
    Globe,
    Car,
    Lock,
    UserX,
    Trash2,
    FileText,
    Shield,
    Info,
    LogOut
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const colors = getColors(isDarkMode);
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState(true);
    const [locationServices, setLocationServices] = useState(true);

    useEffect(() => {
        loadUserData();
        loadSettings();
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

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                setNotifications(parsed.notifications ?? true);
                setLocationServices(parsed.locationServices ?? true);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async (key, value) => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            const parsed = settings ? JSON.parse(settings) : {};
            parsed[key] = value;
            await AsyncStorage.setItem('appSettings', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleToggle = (setting, value, setter) => {
        setter(value);
        saveSettings(setting, value);
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('userData');
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Hesabı Sil',
            'Bu işlem geri alınamaz! Tüm verileriniz silinecektir.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Hesabı Sil',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Bilgi', 'Hesap silme işlemi henüz aktif değil.');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive, showChevron = true }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <Icon size={20} color={isDestructive ? '#FF4757' : Colors.textSecondary} />
                <Text style={[styles.settingLabel, isDestructive && styles.destructiveText]}>
                    {label}
                </Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                {showChevron && <ChevronRight size={20} color={Colors.textSecondary} />}
            </View>
        </TouchableOpacity>
    );

    const SettingToggle = ({ icon: Icon, label, value, onValueChange }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Icon size={20} color={Colors.textSecondary} />
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.primary }}
                thumbColor="#FFF"
            />
        </View>
    );

    const GlassCard = ({ children, style }) => (
        <View style={[styles.glassCard, style]}>
            {children}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <GlassCard>
                        <View style={styles.profileRow}>
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.avatarText}>
                                    {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'AR'}
                                </Text>
                            </LinearGradient>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{userData?.name || 'Alex Roamer'}</Text>
                                <Text style={styles.profileEmail}>{userData?.email || 'alex.roamer@example.com'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => Alert.alert('Coming Soon')}>
                                <Text style={styles.editLink}>Edit Profile {'>'}</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <GlassCard>
                        <SettingToggle
                            icon={Bell}
                            label="Notifications"
                            value={notifications}
                            onValueChange={(v) => handleToggle('notifications', v, setNotifications)}
                        />
                        <View style={styles.divider} />
                        <SettingToggle
                            icon={Moon}
                            label="Dark Mode"
                            value={isDarkMode}
                            onValueChange={(v) => toggleTheme(v)}
                        />
                        <View style={styles.divider} />
                        <SettingToggle
                            icon={MapPin}
                            label="Location Services"
                            value={locationServices}
                            onValueChange={(v) => handleToggle('locationServices', v, setLocationServices)}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon={Globe}
                            label="Language"
                            value="English"
                            onPress={() => Alert.alert('Coming Soon')}
                        />
                    </GlassCard>
                </View>

                {/* Vehicle Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle</Text>
                    <GlassCard>
                        <View style={styles.vehicleRow}>
                            <Car size={24} color={Colors.primary} />
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleLabel}>My Vehicle</Text>
                                <Text style={styles.vehicleValue}>
                                    {userData?.vehicle || '2018 Mercedes Sprinter'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <SettingItem
                            icon={Car}
                            label="Edit vehicle info"
                            onPress={() => Alert.alert('Coming Soon')}
                        />
                    </GlassCard>
                </View>

                {/* Privacy & About Row */}
                <View style={styles.doubleSection}>
                    <View style={styles.halfSection}>
                        <Text style={styles.sectionTitle}>Privacy & Security</Text>
                        <GlassCard style={styles.compactCard}>
                            <TouchableOpacity style={styles.compactItem}>
                                <Lock size={16} color={Colors.textSecondary} />
                                <Text style={styles.compactLabel}>Change Password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.compactItem}>
                                <UserX size={16} color={Colors.textSecondary} />
                                <Text style={styles.compactLabel}>Blocked Users</Text>
                                <ChevronRight size={14} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.compactItem} onPress={handleDeleteAccount}>
                                <Trash2 size={16} color="#FF4757" />
                                <Text style={[styles.compactLabel, { color: '#FF4757' }]}>Delete Account</Text>
                            </TouchableOpacity>
                        </GlassCard>
                    </View>
                    <View style={styles.halfSection}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <GlassCard style={styles.compactCard}>
                            <TouchableOpacity style={styles.compactItem}>
                                <FileText size={16} color={Colors.textSecondary} />
                                <Text style={styles.compactLabel}>Terms of Service</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.compactItem}>
                                <Shield size={16} color={Colors.textSecondary} />
                                <Text style={styles.compactLabel}>Privacy Policy</Text>
                            </TouchableOpacity>
                            <View style={styles.compactItem}>
                                <Info size={16} color={Colors.textSecondary} />
                                <Text style={styles.compactLabel}>App Version</Text>
                                <Text style={styles.versionText}>1.0.0</Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color="#FFF" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    profileEmail: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    editLink: {
        color: Colors.primary,
        fontSize: 13,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        fontSize: 15,
        color: Colors.text,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    settingValue: {
        fontSize: 14,
        color: Colors.primary,
    },
    destructiveText: {
        color: '#FF4757',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 16,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    vehicleValue: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
        marginTop: 2,
    },
    doubleSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    halfSection: {
        flex: 1,
    },
    compactCard: {
        padding: 12,
    },
    compactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    compactLabel: {
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    versionText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
