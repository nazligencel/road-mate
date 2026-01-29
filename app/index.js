import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ImageBackground, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Utils } from 'lucide-react-native'; // Clean up if needed, but for now just swapping
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

export default function LoginScreen() {
    const handleLogin = () => {
        router.replace('/(tabs)/home');
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
                            <View style={styles.signalContainer}>
                                <Text style={styles.statusLabel}>SIGNAL</Text>
                                <View style={styles.signalBars}>
                                    <View style={[styles.bar, { height: 6 }]} />
                                    <View style={[styles.bar, { height: 9 }]} />
                                    <View style={[styles.bar, { height: 12 }]} />
                                    <View style={[styles.bar, { height: 16, backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                                </View>
                            </View>
                            <View style={styles.tempContainer}>
                                <Text style={styles.statusLabel}>CURRENT TEMP</Text>
                                <Text style={styles.tempText}>54°F</Text>
                            </View>
                        </View>

                        {/* Logo Area */}
                        <View style={styles.logoArea}>
                            {/* User requested to keep the logo design (Tent/RV Hookup style) from previous or as specified */}
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
                                <TouchableOpacity style={styles.socialButton}>
                                    {/* Google G Color Logo Image with Rotation */}
                                    <View style={{ marginRight: 12 }}>
                                        <Image
                                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png' }}
                                            style={{ width: 24, height: 24 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    {/* Realistic Apple Logo Image with Rotation */}
                                    <View style={{ marginRight: 12 }}>
                                        <Image
                                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/1200px-Apple_logo_white.svg.png' }}
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

                            {/* Email Login Button */}
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                            >
                                <Text style={styles.loginButtonText}>Login with Email</Text>
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
    loginButton: {
        width: '100%',
        height: 64,
        backgroundColor: ADVENTURE_THEME.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ADVENTURE_THEME.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
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
