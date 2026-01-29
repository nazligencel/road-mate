import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { ArrowRight, MapPin, Flame } from 'lucide-react-native';

export default function WelcomeScreen() {
    const handleGetStarted = () => {
        console.log("Get Started clicked!");
        router.replace('/(tabs)/home');
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=2000&auto=format&fit=crop' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(11, 19, 26, 0.4)', Colors.background]}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <View style={styles.iconRow}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                                <MapPin color={Colors.primary} size={24} />
                            </View>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                                <Flame color={Colors.secondary} size={24} />
                            </View>
                        </View>

                        <Text style={styles.title}>Road<Text style={styles.highlight}>Mate</Text></Text>
                        <Text style={styles.subtitle}>
                            Connect, Date, and Build with fellow Nomads.
                        </Text>

                        <Text style={styles.description}>
                            The ultimate community for van lifers. Find your co-pilot or your next build partner.
                        </Text>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                {
                                    opacity: pressed ? 0.7 : 1,
                                    transform: [{ scale: pressed ? 0.98 : 1 }]
                                }
                            ]}
                            onPress={handleGetStarted}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                            <ArrowRight color="#FFF" size={20} />
                        </Pressable>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        paddingBottom: Platform.OS === 'android' ? 40 : 50,
    },
    content: {
        gap: 16,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -1,
    },
    highlight: {
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        lineHeight: 32,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            }
        }),
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

