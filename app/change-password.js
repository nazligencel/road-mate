
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Lock, Check, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
// In a real app, import auth service here
// import { AuthService } from '../services/AuthService';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Missing Fields", "Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Mismatch", "New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Weak Password", "New password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // Mock API Call simulation
            // const token = await AsyncStorage.getItem('userToken');
            // await AuthService.changePassword(token, currentPassword, newPassword);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

            Alert.alert("Success", "Your password has been updated successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient matches Profile & Settings */}
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>

                        <View style={styles.illustrationParams}>
                            <View style={styles.iconCircle}>
                                <Lock size={40} color={colors.primary} />
                            </View>
                            <Text style={styles.description}>
                                Your new password must be different from previous used passwords.
                            </Text>
                        </View>

                        <View style={styles.formParams}>
                            {/* Current Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter current password"
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showCurrent}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                        {showCurrent ?
                                            <EyeOff size={20} color={colors.textSecondary} /> :
                                            <Eye size={20} color={colors.textSecondary} />
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* New Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showNew}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                        {showNew ?
                                            <EyeOff size={20} color={colors.textSecondary} /> :
                                            <Eye size={20} color={colors.textSecondary} />
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showConfirm}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ?
                                            <EyeOff size={20} color={colors.textSecondary} /> :
                                            <Eye size={20} color={colors.textSecondary} />
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdatePassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.online]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.buttonText}>Update Password</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: colors.cardGlass,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    illustrationParams: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '20', // 20% opacity primary
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    description: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    formParams: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    },
    footer: {
        padding: 24,
        // Ensure footer doesn't get covered by keyboard on Android sometimes
        marginBottom: Platform.OS === 'android' ? 10 : 0,
    },
    updateButton: {
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
