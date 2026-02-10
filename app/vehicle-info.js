
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Car, Truck, Info, Plus, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { UserService, BASE_URL } from '../services/api';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 56) / 3;
const MAX_VEHICLE_PHOTOS = 6;

export default function VehicleInfoScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [vehiclePhotos, setVehiclePhotos] = useState([]);
    const [vehicleData, setVehicleData] = useState({
        vehicle: '',
        vehicleBrand: '',
        vehicleModel: ''
    });

    useEffect(() => {
        loadVehicleData();
    }, []);

    const loadVehicleData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const user = await UserService.getUserDetails(token);
                setVehicleData({
                    vehicle: user.vehicle || '',
                    vehicleBrand: user.vehicleBrand || '',
                    vehicleModel: user.vehicleModel || ''
                });
                // Load vehicle photos from separate endpoint
                try {
                    const photos = await UserService.getVehiclePhotos(token);
                    setVehiclePhotos(photos || []);
                } catch (e) {
                    console.log('Vehicle photos load error:', e);
                }
            }
        } catch (error) {
            console.error('Failed to load vehicle data:', error);
            Alert.alert('Error', 'Failed to load vehicle data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const updateData = {
                    vehicle: vehicleData.vehicle,
                    vehicleBrand: vehicleData.vehicleBrand,
                    vehicleModel: vehicleData.vehicleModel
                };

                await UserService.updateProfile(updateData, token);

                const storedUser = await AsyncStorage.getItem('userData');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    await AsyncStorage.setItem('userData', JSON.stringify({ ...parsed, ...updateData }));
                }

                Alert.alert('Success', 'Vehicle information updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update vehicle information');
        } finally {
            setSaving(false);
        }
    };

    const pickVehicleImage = async () => {
        if (vehiclePhotos.length >= MAX_VEHICLE_PHOTOS) {
            Alert.alert('Limit Reached', `You can add up to ${MAX_VEHICLE_PHOTOS} vehicle photos.`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setUploading(true);
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const data = await UserService.uploadVehicleImage(result.assets[0].uri, token);
                    setVehiclePhotos(prev => [...prev, data]);
                }
            } catch (error) {
                console.error('Upload vehicle image error:', error);
                Alert.alert('Error', 'Failed to upload photo');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDeletePhoto = (photo, index) => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (token) {
                                const imageId = typeof photo === 'object' && photo.id ? photo.id : index;
                                await UserService.deleteVehicleImage(imageId, token);
                                setVehiclePhotos(prev => prev.filter((_, i) => i !== index));
                            }
                        } catch (error) {
                            console.error('Delete vehicle image error:', error);
                            Alert.alert('Error', 'Failed to delete photo');
                        }
                    }
                }
            ]
        );
    };

    const getImageUri = (photo) => {
        if (typeof photo === 'string') {
            return photo.startsWith('http') ? photo : `${BASE_URL}${photo}`;
        }
        const url = photo?.photoUrl || photo?.url;
        if (url) {
            return url.startsWith('http') ? url : `${BASE_URL}${url}`;
        }
        return '';
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Gradient Glow */}
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>
            <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Vehicle Info</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.iconSection}>
                        <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.primary + '20' }]}>
                            <Car size={60} color={colors.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Your Vehicle Details</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={[styles.card, {
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.card,
                            borderColor: colors.cardBorder
                        }]}>
                            {isDarkMode && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
                            <View style={{ gap: 20 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Vehicle Title</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <Truck size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={vehicleData.vehicle}
                                            onChangeText={(text) => setVehicleData({ ...vehicleData, vehicle: text })}
                                            placeholder="e.g. My Home on Wheels"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Brand</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <Info size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={vehicleData.vehicleBrand}
                                            onChangeText={(text) => setVehicleData({ ...vehicleData, vehicleBrand: text })}
                                            placeholder="e.g. Mercedes-Benz"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Model Info</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <Car size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={vehicleData.vehicleModel}
                                            onChangeText={(text) => setVehicleData({ ...vehicleData, vehicleModel: text })}
                                            placeholder="e.g. Sprinter 2021"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Vehicle Photos Section */}
                        <View style={{ marginTop: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Camera size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Vehicle Photos</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                                    ({vehiclePhotos.length}/{MAX_VEHICLE_PHOTOS})
                                </Text>
                            </View>

                            <View style={styles.galleryGrid}>
                                {/* Add Photo Button */}
                                {vehiclePhotos.length < MAX_VEHICLE_PHOTOS && (
                                    <TouchableOpacity
                                        style={[styles.galleryItem, {
                                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.card,
                                            borderWidth: 1.5,
                                            borderStyle: 'dashed',
                                            borderColor: uploading ? colors.primary : colors.cardBorder,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 4,
                                        }]}
                                        onPress={pickVehicleImage}
                                        disabled={uploading}
                                        activeOpacity={0.7}
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
                                )}

                                {/* Photo Grid */}
                                {vehiclePhotos.map((photo, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.galleryItem}
                                        onLongPress={() => handleDeletePhoto(photo, index)}
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={{ uri: getImageUri(photo) }}
                                            style={styles.galleryImage}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {vehiclePhotos.length > 0 && (
                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                                    Long press on a photo to delete
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.bottomSaveBtn}
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#5AB2BF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Save size={20} color="#FFF" />
                                        <Text style={styles.bottomSaveText}>Save Changes</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    iconSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    formContainer: {
        marginBottom: 40,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    galleryItem: {
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    bottomSaveBtn: {
        marginTop: 24,
        borderRadius: 16,
        overflow: 'hidden',
        height: 56,
        shadowColor: '#3893A0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    bottomSaveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
