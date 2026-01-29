import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, Tent, ArrowLeft, Compass, Droplets, Mountain } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Adventure/Nomad Theme Colors (Matching Login Screen)
const ADVENTURE_THEME = {
    primary: '#4A7A8C',
    backgroundDark: '#0D1A1F',
    cardDark: '#1C3038',
    slateAccent: '#2A424A',
    oceanMute: '#162830'
};

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log("Signup successful");
            router.replace('/(tabs)/home');
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Vibrant Overlay Matching Login */}
                <LinearGradient
                    colors={['rgba(74, 122, 140, 0.4)', 'rgba(13, 26, 31, 0.7)', 'rgba(13, 26, 31, 0.9)']}
                    style={styles.gradient}
                >
                    <View style={styles.safeArea}>

                        {/* Status Bar / Top Navigation */}
                        <View style={styles.topBar}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <ArrowLeft color="#FFF" size={24} />
                            </TouchableOpacity>

                            {/* Signal/Temp Mockup */}
                            <View style={styles.topBarRight}>
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
                                    <Text style={styles.statusLabel}>TEMP</Text>
                                    <Text style={styles.tempText}>54°F</Text>
                                </View>
                            </View>
                        </View>

                        {/* Main Content */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.mainContent}
                        >
                            <View style={styles.logoSection}>
                                <View style={styles.logoCircle}>
                                    <Tent color="rgba(255,255,255,0.9)" size={28} strokeWidth={1.5} />
                                </View>
                                <Text style={styles.mainTitle}>JOIN TRIBE</Text>
                            </View>

                            {/* Transparent Flu Card */}
                            <View style={styles.fluCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.welcomeTitle}>Create Account</Text>
                                    <Text style={styles.welcomeSubtitle}>Begin your journey into the wild.</Text>
                                </View>

                                <View style={styles.form}>
                                    <View style={styles.inputWrapper}>
                                        <User color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Full Name"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <Mail color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email Address"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <Lock color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff color="rgba(255,255,255,0.5)" size={20} />
                                            ) : (
                                                <Eye color="rgba(255,255,255,0.5)" size={20} />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.primaryBtn}
                                        onPress={handleSignup}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={styles.primaryBtnText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.footerText}>
                                        Already a member? <Text style={styles.loginLink} onPress={() => router.back()}>Login</Text>
                                    </Text>
                                </View>
                            </View>
                        </KeyboardAvoidingView>

                        {/* Bottom Branding */}
                        <View style={styles.bottomBranding}>
                            <View style={styles.footerIcons}>
                                <Compass color="rgba(255,255,255,0.3)" size={16} />
                                <Droplets color="rgba(255,255,255,0.3)" size={16} />
                                <Mountain color="rgba(255,255,255,0.3)" size={16} />
                            </View>
                            <Text style={styles.establishedText}>ESTABLISHED IN THE WILD</Text>
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
        paddingHorizontal: 32,
        paddingBottom: 48,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        alignItems: 'center',
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        opacity: 0.8,
    },
    signalContainer: {
        gap: 2,
    },
    signalBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    bar: {
        width: 2,
        backgroundColor: ADVENTURE_THEME.primary,
        borderRadius: 1,
    },
    statusLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: ADVENTURE_THEME.primary,
    },
    tempContainer: {
        gap: 2,
        alignItems: 'flex-end',
    },
    tempText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 6,
        textTransform: 'uppercase',
    },
    fluCard: {
        width: '100%',
        // Increased opacity and switched to a dark tint for better white text readability
        backgroundColor: 'rgba(13, 26, 31, 0.60)',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        gap: 24,
    },
    cardHeader: {
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    welcomeSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    form: {
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker input bg for contrast
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        height: '100%',
    },
    primaryBtn: {
        width: '100%',
        height: 56,
        backgroundColor: ADVENTURE_THEME.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ADVENTURE_THEME.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardFooter: {
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    loginLink: {
        color: ADVENTURE_THEME.primary,
        fontWeight: 'bold',
    },
    bottomBranding: {
        alignItems: 'center',
        gap: 12,
        paddingTop: 20,
    },
    footerIcons: {
        flexDirection: 'row',
        gap: 24,
        opacity: 0.5,
    },
    establishedText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
});
