
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ImageBackground, Pressable, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Mail, ArrowRight, Home, Apple, Tent, Compass, Droplets, Mountain } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Adventure/Nomad Theme Colors from HTML
const ADVENTURE_THEME = {
    primary: '#4A7A8C',
    backgroundDark: '#0D1A1F',
    cardDark: '#1C3038',
    slateAccent: '#2A424A',
    oceanMute: '#162830'
};

import * as Location from 'expo-location';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthService } from '../services/AuthService';

// ... (existing imports)

export default function LoginScreen() {
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '458787731751-76itfab6udafkf3l02t5jbstcdks374a.apps.googleusercontent.com',
            offlineAccess: true
        });

        // Animation Loop
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Fetch Weather
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setWeather('ERR');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_weather=true`
                );
                const data = await response.json();
                if (data.current_weather) {
                    setWeather(Math.round(data.current_weather.temperature));
                }
            } catch (error) {
                console.log(error);
                setWeather('N/A');
            }
        })();
    }, []);

    const shimmerTranslate = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width]
    });

    const handleLogin = () => {
        router.replace('/(tabs)/home');
    };



    const handleGoogleLogin = async () => {
        try {
            console.log("Google Login Initiated");
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log("Google User Info:", userInfo);

            // Send token to backend
            const response = await AuthService.googleLogin(userInfo.idToken);
            console.log("Backend Auth Response:", response);

            if (response.token) {
                router.replace('/(tabs)/home');
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("User cancelled the login flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Sign in is in progress");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("Play services not available or outdated");
            } else {
                console.error("Some other error happened:", error);
                alert("Login Failed: " + error.message);
            }
        }
    };

    const handleAppleLogin = () => {
        console.log("Apple Login Initiated");
        // TODO: Integration Steps (Apple):
        // 1. Install 'expo-apple-authentication' package.
        // 2. Use AppleAuthentication.signInAsync() method.
        // 3. Works correctly on iOS devices only.
        alert("Apple Login coming soon!");
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Vibrant Overlay */}
                <LinearGradient
                    colors={['rgba(74, 122, 140, 0.4)', 'rgba(13, 26, 31, 0.7)', 'rgba(13, 26, 31, 0.9)']}
                    style={styles.gradient}
                >
                    <View style={styles.safeArea}>

                        {/* Status Bar */}
                        <View style={styles.statusBarMock}>
                            {/* Signal Removed as requested */}
                            <View />

                            <View style={styles.tempContainer}>
                                <Text style={styles.statusLabel}>TEMP</Text>
                                <Text style={styles.tempText}>{weather !== null ? `${weather}°C` : '...'}</Text>
                            </View>
                        </View>

                        {/* Logo Area */}
                        <View style={styles.logoArea}>
                            <View style={styles.logoBox}>
                                <Tent color="#FFF" size={32} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.title}>NOMAD</Text>
                            <Text style={styles.tagline}>VAST NATURAL SPACES</Text>
                        </View>

                        {/* Bottom Content */}
                        <View style={styles.bottomContent}>
                            <View style={styles.welcomeTextContainer}>
                                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                                <Text style={styles.welcomeSubtitle}>Join the modern tribe of nomads.</Text>
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialGrid}>
                                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                                    <View style={{ marginRight: 12 }}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
                                    <View style={{ marginRight: 12 }}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/mac-os.png' }}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.socialButtonText}>Apple</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Email Login Button with Animated Neon Gradient */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                activeOpacity={0.8}
                                style={styles.loginBtnContainer}
                            >
                                <View style={styles.loginButtonWrapper}>
                                    <LinearGradient
                                        colors={['#4A7A8C', '#45e3ff']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginButton}
                                    >
                                        <Text style={styles.loginButtonText}>Login with Email</Text>
                                    </LinearGradient>

                                    {/* Shimmer Effect Overlay */}
                                    <Animated.View
                                        style={[
                                            StyleSheet.absoluteFill,
                                            {
                                                transform: [{ translateX: shimmerTranslate }]
                                            }
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ flex: 1 }}
                                        />
                                    </Animated.View>
                                </View>
                            </TouchableOpacity>

                            {/* Footer Links */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>New to the tribe? <Text style={styles.createAccountText} onPress={() => router.push('/signup')}>Create Account</Text></Text>

                                <View style={styles.footerIcons}>
                                    <Compass color="rgba(255,255,255,0.4)" size={20} />
                                    <Droplets color="rgba(255,255,255,0.4)" size={20} />
                                    <Mountain color="rgba(255,255,255,0.4)" size={20} />
                                </View>
                                <Text style={styles.footerBrand}>ESTABLISHED IN THE WILD</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ADVENTURE_THEME.backgroundDark,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        padding: 32,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 50,
    },
    statusBarMock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        opacity: 0.8,
    },
    signalContainer: {
        gap: 4,
    },
    statusLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: ADVENTURE_THEME.primary,
        textTransform: 'uppercase',
    },
    signalBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    bar: {
        width: 3,
        backgroundColor: ADVENTURE_THEME.primary,
        borderRadius: 1,
    },
    tempContainer: {
        alignItems: 'flex-end',
        gap: 2,
    },
    tempText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    logoArea: {
        alignItems: 'center',
        marginTop: -40,
    },
    logoBox: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 8,
        marginBottom: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    tagline: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 5,
        textTransform: 'uppercase',
    },
    bottomContent: {
        gap: 24,
    },
    welcomeTextContainer: {
        gap: 4,
    },
    welcomeTitle: {
        fontSize: 30, // Slightly larger as per HTML
        fontWeight: 'bold',
        color: '#FFF',
    },
    welcomeSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    socialGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    loginBtnContainer: {
        width: '100%',
        shadowColor: '#45e3ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    loginButtonWrapper: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        overflow: 'hidden', // Masks the shimmer
    },
    loginButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16, // Ensure border radius matches wrapper
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    footer: {
        alignItems: 'center',
        gap: 24,
        marginTop: 10,
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    createAccountText: {
        color: ADVENTURE_THEME.primary,
        fontWeight: 'bold',
    },
    footerIcons: {
        flexDirection: 'row',
        gap: 40,
        opacity: 0.4,
    },
    footerBrand: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
});
