import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings, MapPin, Calendar, Grid, Image as ImageIcon, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionService, UserService, BASE_URL } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useDiscussions } from '../../contexts/DiscussionContext';

const { width } = Dimensions.get('window');

const PHOTOS = [
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&q=80',
    'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&q=80',
];

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
    const [galleryPhotos, setGalleryPhotos] = useState(PHOTOS);
    const { savedIds } = useDiscussions();

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [])
    );

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
                    bio: profileData.bio || 'Van Life Enthusiast | Explorer',
                    location: profileData.location || 'Currently in Antalya',
                    image: profileData.profileImage ? { uri: profileData.profileImage } : null,
                    vehicle: profileData.vehicle || profileData.vehicleModel || 'Not set',
                    joinDate: profileData.createdAt
                        ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'Unknown',
                });

                // Use backend gallery or fallback to dummy photos if empty
                if (profileData.galleryImages && profileData.galleryImages.length > 0) {
                    setGalleryPhotos(profileData.galleryImages);
                } else {
                    setGalleryPhotos(PHOTOS); // Keep dummy photos for visual if none
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

    const handleImageSelect = () => {
        // Placeholder for gallery image selection logic
        // In a real app, this would open the image picker
        console.log('Select image for gallery');
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
                    </View>

                    <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
                    <Text style={styles.username}>{user?.username}</Text>

                    <Text style={styles.bio}>{user?.bio}</Text>

                    <View style={styles.locationContainer}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={styles.locationText}>{user?.location}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{connectionCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Connections</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
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
                </View>

                {/* Vehicle & Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Info</Text>
                    <BlurView intensity={isDarkMode ? 20 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Vehicle</Text>
                            <Text style={styles.infoValue}>{user?.vehicle}</Text>
                        </View>
                        <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Calendar size={14} color={colors.textSecondary} />
                                <Text style={styles.infoValue}>{user?.joinDate}</Text>
                            </View>
                        </View>
                    </BlurView>
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
                        >
                            <Plus color={colors.primary} size={24} />
                            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>Add Photo</Text>
                        </TouchableOpacity>

                        {galleryPhotos.map((photo, index) => (
                            <TouchableOpacity key={index} style={styles.galleryItem}>
                                <Image
                                    source={typeof photo === 'string' ? { uri: photo } : photo}
                                    style={styles.galleryImage}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
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
});
