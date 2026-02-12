import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity,
    ActivityIndicator, Modal, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, MapPin, Car, MessageSquare, X, UserPlus, Clock, UserCheck, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService, ConnectionService, BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('NONE');
    const [friendLoading, setFriendLoading] = useState(false);

    useEffect(() => {
        loadProfile();
        loadConnectionStatus();
    }, [id]);

    const loadProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token && id) {
                const data = await UserService.getPublicProfile(id, token);
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading public profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadConnectionStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token && id) {
                const result = await ConnectionService.getConnectionStatus(id, token);
                setConnectionStatus(result.status || 'NONE');
            }
        } catch (error) {
            console.error('Error loading connection status:', error);
        }
    };

    const handleFriendAction = async () => {
        if (friendLoading) return;
        setFriendLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            if (connectionStatus === 'NONE') {
                const result = await ConnectionService.sendConnectionRequest(id, token);
                if (result.success) setConnectionStatus('PENDING_SENT');
            } else if (connectionStatus === 'PENDING_RECEIVED') {
                // Find the connection to accept — need to get pending requests
                const pending = await ConnectionService.getPendingRequests(token);
                const match = pending.find(c => c.user?.id?.toString() === id?.toString());
                if (match) {
                    const result = await ConnectionService.acceptConnection(match.id, token);
                    if (result.success) setConnectionStatus('FRIENDS');
                }
            }
        } catch (error) {
            console.error('Error with friend action:', error);
        } finally {
            setFriendLoading(false);
        }
    };

    const getImageUri = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${BASE_URL}${url}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profile) return null;

    const profileImage = getImageUri(profile.profileImageUrl);
    const vehiclePhotos = profile.vehiclePhotos || [];
    const galleryPhotos = profile.galleryPhotos || [];
    const vehicleDisplay = profile.vehicleBrand && profile.vehicleModel
        ? `${profile.vehicleBrand} ${profile.vehicleModel}`
        : (profile.vehicle || 'Not set');

    return (
        <View style={styles.container}>
            {/* Background Image / Gradient */}
            <View style={styles.headerBackground}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.headerImage} blurRadius={10} />
                ) : (
                    <LinearGradient
                        colors={[colors.primary, '#0f172a']}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <LinearGradient
                    colors={['transparent', colors.background]}
                    style={styles.headerOverlay}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Bar */}
                <View style={styles.headerBar}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                        <ArrowLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                    <View style={{ width: 40 }} />
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={profileImage ? { uri: profileImage } : { uri: 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={styles.name}>{profile.name || 'Nomad'}</Text>
                    {profile.username ? (
                        <Text style={styles.username}>@{profile.username.replace('@', '')}</Text>
                    ) : null}

                    {profile.tagline ? (
                        <Text style={styles.tagline}>{profile.tagline}</Text>
                    ) : null}

                    {profile.location ? (
                        <View style={styles.locationContainer}>
                            <MapPin size={14} color={colors.textSecondary} />
                            <Text style={styles.locationText}>{profile.location}</Text>
                        </View>
                    ) : null}

                    {/* Friend Button */}
                    <TouchableOpacity
                        style={{ width: '100%', marginTop: 12 }}
                        onPress={handleFriendAction}
                        disabled={friendLoading || connectionStatus === 'PENDING_SENT' || connectionStatus === 'FRIENDS'}
                    >
                        <View style={[styles.friendBtn, {
                            backgroundColor: connectionStatus === 'FRIENDS' ? colors.primary + '20' :
                                connectionStatus === 'PENDING_SENT' ? colors.textSecondary + '20' :
                                connectionStatus === 'PENDING_RECEIVED' ? '#22c55e' + '20' :
                                colors.primary + '15',
                            borderColor: connectionStatus === 'FRIENDS' ? colors.primary :
                                connectionStatus === 'PENDING_SENT' ? colors.textSecondary :
                                connectionStatus === 'PENDING_RECEIVED' ? '#22c55e' :
                                colors.primary,
                        }]}>
                            {friendLoading ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : connectionStatus === 'FRIENDS' ? (
                                <>
                                    <Users size={18} color={colors.primary} />
                                    <Text style={[styles.friendBtnText, { color: colors.primary }]}>Friends</Text>
                                </>
                            ) : connectionStatus === 'PENDING_SENT' ? (
                                <>
                                    <Clock size={18} color={colors.textSecondary} />
                                    <Text style={[styles.friendBtnText, { color: colors.textSecondary }]}>Request Sent</Text>
                                </>
                            ) : connectionStatus === 'PENDING_RECEIVED' ? (
                                <>
                                    <UserCheck size={18} color="#22c55e" />
                                    <Text style={[styles.friendBtnText, { color: '#22c55e' }]}>Accept Request</Text>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} color={colors.primary} />
                                    <Text style={[styles.friendBtnText, { color: colors.primary }]}>Add Friend</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Message Button */}
                    <TouchableOpacity
                        style={{ width: '100%', marginTop: 8 }}
                        onPress={() => {
                            router.push({
                                pathname: `/chat/${id}`,
                                params: {
                                    name: profile.name,
                                    avatar: profileImage
                                }
                            });
                        }}
                    >
                        <LinearGradient
                            colors={[colors.primary, '#5AB2BF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.messageBtn}
                        >
                            <MessageSquare size={18} color="#FFF" />
                            <Text style={styles.messageBtnText}>Send Message</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Vehicle & Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle & Info</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <View style={styles.vehicleIconContainer}>
                                    <Car size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoValue}>{vehicleDisplay}</Text>
                                    {profile.vehicle ? (
                                        <Text style={styles.infoLabel}>{profile.vehicle}</Text>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Vehicle Photos */}
                {vehiclePhotos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vehicle Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
                            {vehiclePhotos.map((photo) => {
                                const uri = getImageUri(photo.photoUrl);
                                return (
                                    <TouchableOpacity
                                        key={photo.id}
                                        style={styles.vehiclePhotoItem}
                                        onPress={() => setSelectedImage(uri)}
                                    >
                                        {uri && <Image source={{ uri }} style={styles.vehiclePhotoImage} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Gallery */}
                {galleryPhotos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gallery</Text>
                        <View style={styles.galleryGrid}>
                            {galleryPhotos.map((photo) => {
                                const uri = getImageUri(photo.photoUrl);
                                return (
                                    <TouchableOpacity
                                        key={photo.id}
                                        style={styles.galleryItem}
                                        onPress={() => setSelectedImage(uri)}
                                    >
                                        {uri && <Image source={{ uri }} style={styles.galleryImage} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Photo Preview Modal */}
            <Modal visible={!!selectedImage} transparent animationType="fade">
                <View style={styles.previewOverlay}>
                    <TouchableOpacity
                        style={styles.previewCloseBtn}
                        onPress={() => setSelectedImage(null)}
                    >
                        <X size={24} color="#FFF" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
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
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
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
    tagline: {
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
    friendBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
    },
    friendBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    messageBtnText: {
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
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    vehicleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoValue: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    infoLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    photoScroll: {
        gap: 10,
    },
    vehiclePhotoItem: {
        width: width * 0.55,
        height: width * 0.38,
        borderRadius: 16,
        overflow: 'hidden',
    },
    vehiclePhotoImage: {
        width: '100%',
        height: '100%',
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
    previewCloseBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    previewImage: {
        width: width - 32,
        height: width - 32,
        borderRadius: 12,
    },
});
