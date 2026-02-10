
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User, Mail, FileText, Camera, Sparkles, Wand2, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { UserService, BASE_URL } from '../services/api';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro } = useSubscription();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        vehicle: '',
        vehicleBrand: '',
        vehicleModel: '',
        bio: '',
        tagline: '',
        location: '',
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
                    vehicleBrand: user.vehicleBrand || '',
                    vehicleModel: user.vehicleModel || '',
                    bio: user.status || '',
                    tagline: user.tagline || '',
                    location: user.location || '',
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
        if (!userData.name || !userData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        if (userData.name.trim().length > 50) {
            Alert.alert('Error', 'Name must be at most 50 characters');
            return;
        }

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const updateData = {
                    name: userData.name,
                    status: userData.bio,
                    tagline: userData.tagline,
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

    const generateTaglineSuggestions = async () => {
        setAiLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const prompt = `Generate 5 short creative profile taglines (max 40 chars each) for a road trip / van life app user. User info: Name: "${userData.name}", Vehicle: "${userData.vehicleBrand} ${userData.vehicleModel}".  Return ONLY a JSON array of 5 strings, no explanation. Example: ["Tagline 1","Tagline 2","Tagline 3","Tagline 4","Tagline 5"]`;

            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message: prompt }),
            });

            if (!response.ok) {
                Alert.alert('Error', 'Failed to generate suggestions');
                return;
            }

            const data = await response.json();
            const parsed = JSON.parse(data.reply);
            setAiSuggestions(Array.isArray(parsed) ? parsed : []);
            setShowAiSuggestions(true);
        } catch (error) {
            console.error('AI tagline error:', error);
            Alert.alert('Error', 'Could not generate tagline suggestions');
        } finally {
            setAiLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
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
                                            maxLength={50}
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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Tagline</Text>
                                        {isPro && (
                                            <TouchableOpacity
                                                onPress={generateTaglineSuggestions}
                                                disabled={aiLoading}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                                    backgroundColor: '#C5A05915', paddingHorizontal: 10, paddingVertical: 4,
                                                    borderRadius: 8, borderWidth: 1, borderColor: '#C5A05930',
                                                }}
                                            >
                                                {aiLoading ? (
                                                    <ActivityIndicator size={14} color="#C5A059" />
                                                ) : (
                                                    <Wand2 size={14} color="#C5A059" />
                                                )}
                                                <Text style={{ color: '#C5A059', fontSize: 12, fontWeight: '600' }}>AI Suggest</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={[styles.inputWrapper, {
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : colors.background,
                                        borderColor: colors.border
                                    }]}>
                                        <Sparkles size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            value={userData.tagline}
                                            onChangeText={(text) => setUserData({ ...userData, tagline: text })}
                                            placeholder="e.g. Van Life Enthusiast | Explorer"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                            maxLength={50}
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

            {/* AI Suggestions Modal */}
            <Modal visible={showAiSuggestions} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, {
                        backgroundColor: isDarkMode ? '#1a1a2e' : '#fff',
                        borderColor: colors.cardBorder,
                    }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Wand2 size={20} color="#C5A059" />
                                <Text style={[styles.modalTitle, { color: colors.text }]}>AI Suggestions</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAiSuggestions(false)}>
                                <X size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
                            Tap a suggestion to use it as your tagline
                        </Text>
                        {aiSuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, {
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    borderColor: colors.cardBorder,
                                }]}
                                onPress={() => {
                                    setUserData({ ...userData, tagline: suggestion });
                                    setShowAiSuggestions(false);
                                }}
                            >
                                <Sparkles size={16} color={colors.primary} />
                                <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
});
