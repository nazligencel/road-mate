import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Colors } from '../../constants/Colors';
import { Settings, Edit2, LogOut, Camera, Grid, QrCode, Scan, Plus } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PHOTOS = [
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=300&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=300&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=300&q=80',
];

export default function ProfileScreen() {
    const router = useRouter();
    const [qrVisible, setQrVisible] = useState(false);
    const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80');
    const [isUploading, setIsUploading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [connectionCount, setConnectionCount] = useState(0);
    const [galleryPhotos, setGalleryPhotos] = useState(PHOTOS);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const loadUserData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            const token = await AsyncStorage.getItem('userToken');

            if (userDataStr) {
                const user = JSON.parse(userDataStr);
                setUserData(user);
                if (user.image) {
                    setProfileImage(user.image);
                }
            }

            if (token) {
                const countResult = await ConnectionService.getConnectionCount(token);
                setConnectionCount(countResult.count || 0);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const openQRScanner = () => {
        router.push('/scan-qr');
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setIsUploading(true);
                setProfileImage(result.assets[0].uri);
                setIsUploading(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const addGalleryPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setGalleryPhotos(prev => [result.assets[0].uri, ...prev]);
                Alert.alert('Success', 'Photo added to gallery!');
            }
        } catch (error) {
            console.error('Error adding gallery photo:', error);
            Alert.alert('Error', 'Failed to add photo. Please try again.');
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Background Gradient Only - No Glass Cards */}
            <LinearGradient
                colors={[Colors.background, '#1e293b', Colors.background]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity onPress={openQRScanner}>
                            <Scan color={Colors.text} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setQrVisible(true)}>
                            <QrCode color={Colors.text} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/settings')}>
                            <Settings color={Colors.text} size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.avatar}
                        />
                        {isUploading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator color="#FFF" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.editBtn} onPress={pickImage}>
                            <Edit2 size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{userData?.name || 'Road Mate User'}</Text>
                    <Text style={styles.bio}>{userData?.status || 'Digital Nomad & Van Builder'}</Text>

                    {/* Stats Row - Original box style, just updated colors/border for theme compatibility */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{connectionCount}</Text>
                            <Text style={styles.statLabel}>Connections</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Build Posts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>4.8</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={{ width: '100%' }}>
                        <LinearGradient
                            colors={['rgba(244, 63, 94, 0.2)', 'rgba(244, 63, 94, 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.premiumBanner}
                        >
                            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                            <Text style={styles.premiumDesc}>See who liked you & unlimited swipes</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.gallerySection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Gallery</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={addGalleryPhoto}>
                                <Camera size={20} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Grid size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.grid}>
                        {/* Add Photo Button */}
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={addGalleryPhoto}>
                            <Plus size={28} color={Colors.primary} />
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </TouchableOpacity>
                        {galleryPhotos.map((photo, index) => (
                            <Image key={index} source={{ uri: photo }} style={styles.gridImage} />
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn}>
                    <LogOut size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                {/* QR Modal */}
                <Modal
                    visible={qrVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setQrVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setQrVisible(false)}
                    >
                        <View style={styles.qrContainer}>
                            <Text style={styles.qrTitle}>My Connection QR</Text>
                            <View style={styles.qrWrapper}>
                                <QRCode
                                    value={`road-mate://nomad/${userData?.id || 'guest'}`}
                                    size={200}
                                    color={Colors.background}
                                    backgroundColor="#FFF"
                                />
                            </View>
                            <Text style={styles.qrDesc}>Other nomads can scan this to connect with you.</Text>
                            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setQrVisible(false)}>
                                <Text style={styles.closeModalText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    editBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: Colors.background,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        justifyContent: 'space-around',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    premiumBanner: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(244, 63, 94, 0.3)',
        alignItems: 'center',
    },
    premiumTitle: {
        color: '#F43F5E',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    premiumDesc: {
        color: Colors.textSecondary,
        fontSize: 12,
        opacity: 0.9,
    },
    gallerySection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridImage: {
        width: (width - 48 - 12) / 2,
        height: 150,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    addPhotoBtn: {
        width: (width - 48 - 12) / 2,
        height: 150,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 2,
        borderColor: Colors.primary + '60',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addPhotoText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 40,
    },
    logoutText: {
        color: Colors.error,
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        padding: 30,
        borderRadius: 30,
        alignItems: 'center',
        width: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    qrTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 20,
    },
    qrDesc: {
        color: '#BBB',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
    },
    closeModalBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 15,
    },
    closeModalText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
