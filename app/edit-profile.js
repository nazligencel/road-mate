
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Car, FileText, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { UserService, BASE_URL } from '../services/api';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        vehicle: '',
        bio: '', // Assuming 'status' is mapped to bio or similar
        profileImageUrl: null
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const user = await UserService.getUserDetails(token);
                setUserData({
                    name: user.name || '',
                    email: user.email || '',
                    vehicle: user.vehicle || '',
                    bio: user.status || '', // Using status as bio
                    profileImageUrl: user.profileImageUrl ?
                        (user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${BASE_URL}${user.profileImageUrl}`)
                        : null
                });
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const updateData = {
                    name: userData.name,
                    vehicle: userData.vehicle,
                    status: userData.bio,
                };

                await UserService.updateProfile(updateData, token);

                const storedUser = await AsyncStorage.getItem('userData');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    await AsyncStorage.setItem('userData', JSON.stringify({ ...parsed, ...updateData }));
                }

                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
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
                setLoading(true);
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const uploadResult = await UserService.uploadProfileImage(result.assets[0].uri, token);
                    if (uploadResult.imageUrl) {
                        const fullUrl = uploadResult.imageUrl.startsWith('http')
                            ? uploadResult.imageUrl
                            : `${BASE_URL}${uploadResult.imageUrl}`;

                        setUserData(prev => ({ ...prev, profileImageUrl: fullUrl }));
                    }
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating image:', error);
            Alert.alert('Error', 'Failed to update profile picture');
            setLoading(false);
        }
    };

    if (loading && !userData.name) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                {isDarkMode ? (
                    <LinearGradient
                        colors={[colors.background, '#1e293b', colors.background]}
                        style={StyleSheet.absoluteFill}
                    />
                ) : null}
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <View style={styles.avatarContainer}>
                            {userData.profileImageUrl ? (
                                <Image source={{ uri: userData.profileImageUrl }} style={[styles.avatar, { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : colors.primary + '40' }]} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder, {
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.primary + '20',
                                    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : colors.primary + '40'
                                }]}>
                                    <Text style={[styles.avatarText, { color: isDarkMode ? 'rgba(255,255,255,0.5)' : colors.primary }]}>
                                        {userData.name ? userData.name.substring(0, 2).toUpperCase() : 'RM'}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity style={[styles.changePhotoBtn, { borderColor: colors.background }]} onPress={pickImage}>
                                <Camera size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Profile Photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        <View style={[styles.card, {
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.card,
                            borderColor: colors.cardBorder
                        }]}>
                            {isDarkMode && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
                            <View style={{ gap: 20 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={userData.name}
                                            onChangeText={(text) => setUserData({ ...userData, name: text })}
                                            placeholder="Enter your name"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email (Read Only)</Text>
                                    <View style={[styles.inputWrapper, styles.disabledInput, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.1)' : colors.background + '80',
                                        borderColor: colors.border
                                    }]}>
                                        <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text, opacity: 0.7 }]}
                                            value={userData.email}
                                            editable={false}
                                            placeholder="Your email"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Vehicle Model</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <Car size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={userData.vehicle}
                                            onChangeText={(text) => setUserData({ ...userData, vehicle: text })}
                                            placeholder="e.g. Mercedes Sprinter"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Bio / Status</Text>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border,
                                        height: 100,
                                        alignItems: 'flex-start',
                                        paddingVertical: 12
                                    }]}>
                                        <FileText size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text, height: '100%', textAlignVertical: 'top' }]}
                                            value={userData.bio}
                                            onChangeText={(text) => setUserData({ ...userData, bio: text })}
                                            placeholder="Tell us about your journey..."
                                            placeholderTextColor={colors.textSecondary + '80'}
                                            multiline
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.bottomSaveBtn}
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#5AB2BF']} // Using a slightly lighter shade for gradient
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
    imageSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    changePhotoBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3893A0', // Updated primary
        padding: 10,
        borderRadius: 20,
        borderWidth: 3,
    },
    changePhotoText: {
        fontSize: 16,
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
    disabledInput: {
        // Additional styles if needed
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
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
