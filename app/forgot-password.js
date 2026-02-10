import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ImageBackground, Animated, Easing, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, ChevronLeft, Tent, CheckCircle2, ArrowRight, Lock, KeyRound, Eye, EyeOff } from 'lucide-react-native';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { isValidEmail } from '../utils/validation';
import { BASE_URL } from '../services/api';

const { width, height } = Dimensions.get('window');

const ADVENTURE_THEME = {
    primary: '#4A7A8C',
    backgroundDark: '#0D1A1F',
    cardDark: '#1C3038',
    slateAccent: '#2A424A',
    oceanMute: '#162830'
};

export default function ForgotPasswordScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    // Steps: 'email' | 'code' | 'password' | 'success'
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 2500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const shimmerTranslate = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width]
    });

    const handleSendEmail = async () => {
        if (!email || !isValidEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to send email');
            }
            setStep('code');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to send email. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code.length < 4) {
            Alert.alert('Invalid Code', 'Please enter the verification code sent to your email.');
            return;
        }
        setLoading(true);
        try {
            // Code will be verified together with password reset
            setStep('password');
        } catch (error) {
            Alert.alert('Error', 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to reset password');
            }
            setStep('success');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'email':
                return (
                    <View style={{ width: '100%', gap: 24 }}>
                        <View>
                            <Text style={styles.title}>Recovery</Text>
                            <Text style={styles.subtitle}>Enter your email to receive a secure verification code.</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Mail color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nomad Email"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <MainButton onPress={handleSendEmail} loading={loading} text="Send Code" />
                    </View>
                );
            case 'code':
                return (
                    <View style={{ width: '100%', gap: 24 }}>
                        <View>
                            <Text style={styles.title}>Verify Code</Text>
                            <Text style={styles.subtitle}>We sent a code to {email}. Enter it below.</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <KeyRound color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="4-6 Digit Code"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>
                        <MainButton onPress={handleVerifyCode} loading={loading} text="Verify Code" />
                        <TouchableOpacity onPress={() => setStep('email')}>
                            <Text style={styles.backLink}>Change Email</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'password':
                return (
                    <View style={{ width: '100%', gap: 24 }}>
                        <View>
                            <Text style={styles.title}>New Password</Text>
                            <Text style={styles.subtitle}>Create a strong new password for your journey.</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Lock color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.5)" /> : <Eye size={20} color="rgba(255,255,255,0.5)" />}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <CheckCircle2 color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                        <MainButton onPress={handleResetPassword} loading={loading} text="Update Password" />
                    </View>
                );
            case 'success':
                return (
                    <View style={styles.successView}>
                        <View style={styles.successIconWrapper}>
                            <CheckCircle2 color={colors.primary} size={64} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.title}>All Set!</Text>
                        <Text style={styles.subtitle}>Your password has been successfully updated. You can now log in with your new credentials.</Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/')}>
                            <Text style={styles.doneBtnText}>Go to Login</Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    const MainButton = ({ onPress, loading, text }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.submitBtnContainer} disabled={loading}>
            <View style={styles.submitButtonWrapper}>
                <LinearGradient colors={['#4A7A8C', '#5AB2BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitButton}>
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.submitButtonText}>{text}</Text>
                            <ArrowRight color="#FFF" size={20} />
                        </View>
                    )}
                </LinearGradient>
                {!loading && (
                    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: shimmerTranslate }] }]}>
                        <LinearGradient colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
                    </Animated.View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop' }} style={styles.backgroundImage} resizeMode="cover">
                <LinearGradient colors={['rgba(74, 122, 140, 0.4)', 'rgba(13, 26, 31, 0.85)', 'rgba(13, 26, 31, 0.95)']} style={styles.gradient}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safeArea}>
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backButton} onPress={() => step === 'email' ? router.back() : setStep('email')}>
                                <ChevronLeft color="#FFF" size={28} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.content}>
                            <View style={styles.logoBox}><Tent color="#FFF" size={32} strokeWidth={2} /></View>
                            {renderStep()}
                        </View>
                        <View style={styles.footer}><Text style={styles.footerBrand}>ROADMATE SECURE RECOVERY</Text></View>
                    </KeyboardAvoidingView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ADVENTURE_THEME.backgroundDark },
    backgroundImage: { flex: 1 },
    gradient: { flex: 1 },
    safeArea: { flex: 1, padding: 32, paddingTop: Platform.OS === 'android' ? 50 : 60 },
    header: { height: 50, justifyContent: 'center' },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: -10 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -60 },
    logoBox: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    title: { fontSize: 32, fontWeight: '800', color: '#FFF', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 64, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 20 },
    inputIcon: { marginRight: 16 },
    input: { flex: 1, color: '#FFF', fontSize: 16, height: '100%' },
    submitBtnContainer: { width: '100%', shadowColor: '#5AB2BF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginTop: 10 },
    submitButtonWrapper: { width: '100%', height: 64, borderRadius: 20, overflow: 'hidden' },
    submitButton: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    backLink: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
    successView: { alignItems: 'center', width: '100%' },
    successIconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74, 122, 140, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(74, 122, 140, 0.4)' },
    doneBtn: { marginTop: 32, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    footer: { alignItems: 'center', marginBottom: 20 },
    footerBrand: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold', letterSpacing: 4 },
});
