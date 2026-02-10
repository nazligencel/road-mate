import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings, MapPin, Grid, Image as ImageIcon, Plus, Crown, Car, ChevronRight, Trash2, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionService, UserService, BASE_URL } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSettings } from '../../contexts/SettingsContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');


export default function ProfileScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');
    const { savedIds } = useDiscussions();
    const { isPro } = useSubscription();
    const { locationServices, t } = useSettings();

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
            if (locationServices) {
                fetchCurrentLocation();
            } else {
                setCurrentLocation(t('locationDisabled'));
            }
        }, [locationServices])
    );

    const fetchCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const [place] = await Location.reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });

            if (place) {
                const city = place.city || place.subregion || place.region || '';
                const country = place.country || '';
                setCurrentLocation(city ? `${city}, ${country}` : country);
            }
        } catch (e) {
            console.log('Location fetch error:', e.message);
        }
    };

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const [profileData, countData] = await Promise.all([
                    UserService.getUserDetails(token),
                    ConnectionService.getConnectionCount(token)
                ]);

                setUser({
                    id: profileData.id,
                    name: profileData.name,
                    username: profileData.username || `@${profileData.name.replace(/\s+/g, '').toLowerCase()}`,
                    tagline: profileData.tagline || '',
                    bio: profileData.status || '',
                    location: profileData.location || '',
                    image: profileData.profileImageUrl
                        ? { uri: profileData.profileImageUrl.startsWith('http') ? profileData.profileImageUrl : `${BASE_URL}${profileData.profileImageUrl}` }
                        : null,
                    vehicle: profileData.vehicle || '',
                    vehicleBrand: profileData.vehicleBrand || '',
                    vehicleModel: profileData.vehicleModel || '',
                });

                // Load gallery photos from separate endpoint
                try {
                    const photos = await UserService.getGalleryPhotos(token);
                    setGalleryPhotos(photos || []);
                } catch (e) {
                    console.log('Gallery load error:', e);
                }

                setConnectionCount(countData.count);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadUserProfile();
    };

    const handleImageSelect = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setUploading(true);
                const token = await AsyncStorage.getItem('userToken');
                const uploaded = await UserService.uploadGalleryImage(result.assets[0].uri, token);
                setGalleryPhotos(prev => [...prev, uploaded]);
                setUploading(false);
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            Alert.alert('Error', 'Failed to upload photo.');
            setUploading(false);
        }
    };

    const handleDeletePhoto = (photo, index) => {
        Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        const imageId = typeof photo === 'object' ? photo.id : null;
                        if (imageId) {
                            await UserService.deleteGalleryImage(imageId, token);
                        }
                        setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
                    } catch (error) {
                        console.error('Delete photo error:', error);
                        Alert.alert('Error', 'Failed to delete photo.');
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Background Image / Gradient */}
            <View style={styles.headerBackground}>
                {user?.image ? (
                    <Image source={user.image} style={styles.headerImage} blurRadius={10} />
                ) : (
                    <LinearGradient
                        colors={[colors.primary, '#0f172a']}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                {/* Overlay Gradient for Fade */}
                <LinearGradient
                    colors={['transparent', colors.background]}
                    style={styles.headerOverlay}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />
                }
            >
                {/* Header Actions */}
                <View style={styles.headerBar}>
                    <View style={{ width: 40 }} />
                    <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
                        <Settings color="#FFF" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={user?.image || { uri: 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.onlineStatus} />
                        {isPro && (
                            <View style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: '#C5A059',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 2.5,
                                borderColor: colors.background,
                                shadowColor: '#C5A059',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.5,
                                shadowRadius: 4,
                                elevation: 5,
                            }}>
                                <Crown size={14} color="#FFF" strokeWidth={2.5} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
                    <Text style={styles.username}>{user?.username}</Text>

                    {user?.tagline ? (
                        <Text style={styles.bio}>{user.tagline}</Text>
                    ) : null}

                    {currentLocation ? (
                        <View style={styles.locationContainer}>
                            <MapPin size={14} color={colors.textSecondary} />
                            <Text style={styles.locationText}>{currentLocation}</Text>
                        </View>
                    ) : null}

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{connectionCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Connections</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{galleryPhotos.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Build Posts</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                        <TouchableOpacity style={styles.stat} onPress={() => router.push('/saved-discussions')}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{savedIds.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookmarks</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={{ width: '100%' }} onPress={() => router.push('/edit-profile')}>
                        <LinearGradient
                            colors={[colors.primary, '#5AB2BF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.editBtn}
                        >
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {!isPro && (
                        <TouchableOpacity style={{ width: '100%', marginTop: 8 }} onPress={() => router.push('/paywall')}>
                            <LinearGradient
                                colors={['#C5A059', '#E8C66A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.editBtn, { flexDirection: 'row', gap: 8, justifyContent: 'center' }]}
                            >
                                <Crown size={16} color="#FFF" />
                                <Text style={styles.editBtnText}>Upgrade to Pro</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Vehicle & Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle & Info</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/vehicle-info')}>
                        <BlurView intensity={isDarkMode ? 20 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        backgroundColor: colors.primary + '15',
                                        justifyContent: 'center', alignItems: 'center',
                                    }}>
                                        <Car size={20} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoValue}>
                                            {user?.vehicleBrand && user?.vehicleModel
                                                ? `${user.vehicleBrand} ${user.vehicleModel}`
                                                : (user?.vehicle || 'Not set')}
                                        </Text>
                                        {user?.vehicle ? (
                                            <Text style={[styles.infoLabel, { marginTop: 2 }]}>{user.vehicle}</Text>
                                        ) : null}
                                    </View>
                                </View>
                                <ChevronRight size={16} color={colors.textSecondary} />
                            </View>
                        </BlurView>
                    </TouchableOpacity>

                </View>

                {/* Gallery Section */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.sectionTitle}>Gallery</Text>
                    </View>

                    <View style={styles.galleryGrid}>
                        {/* Add Photo Card */}
                        <TouchableOpacity
                            style={[styles.galleryItem, {
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.card,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                borderColor: colors.cardBorder,
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 4
                            }]}
                            onPress={handleImageSelect}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Plus color={colors.primary} size={24} />
                                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>Add Photo</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {galleryPhotos.map((photo, index) => {
                            const photoUrl = typeof photo === 'object' ? (photo.photoUrl || photo.url) : photo;
                            const uri = photoUrl
                                ? (photoUrl.startsWith('http') ? photoUrl : `${BASE_URL}${photoUrl}`)
                                : null;
                            return (
                                <TouchableOpacity
                                    key={typeof photo === 'object' ? photo.id || index : index}
                                    style={styles.galleryItem}
                                    onPress={() => setSelectedImage({ photo, index, uri })}
                                >
                                    {uri && <Image source={{ uri }} style={styles.galleryImage} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>

            {/* Photo Preview Modal */}
            <Modal visible={!!selectedImage} transparent animationType="fade">
                <View style={styles.previewOverlay}>
                    <View style={styles.previewHeader}>
                        <TouchableOpacity
                            style={styles.previewDeleteBtn}
                            onPress={() => {
                                const { photo, index } = selectedImage;
                                setSelectedImage(null);
                                handleDeletePhoto(photo, index);
                            }}
                        >
                            <Trash2 size={22} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.previewCloseBtn}
                            onPress={() => setSelectedImage(null)}
                        >
                            <X size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    {selectedImage?.uri && (
                        <Image
                            source={{ uri: selectedImage.uri }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerBackground: {
        height: 280,
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    headerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 100,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileCard: {
        marginHorizontal: 20,
        backgroundColor: colors.glassBackground,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 8,
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.background,
    },
    onlineStatus: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.online,
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: colors.background,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 2,
    },
    username: {
        fontSize: 13,
        color: colors.primary,
        marginBottom: 2,
    },
    bio: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        backgroundColor: colors.glassBackground,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    locationText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    editBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    infoCard: {
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    infoValue: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginVertical: 12,
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    galleryItem: {
        width: (width - 56) / 3,
        height: (width - 56) / 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        right: 20,
        flexDirection: 'row',
        gap: 16,
        zIndex: 10,
    },
    previewDeleteBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(239,68,68,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: width - 32,
        height: width - 32,
        borderRadius: 12,
    },
});
