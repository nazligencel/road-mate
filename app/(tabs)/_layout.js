import { Tabs } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Compass, Wrench, MessageCircle, User } from 'lucide-react-native';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Forced reload check
export default function TabLayout() {
    const { isDarkMode } = useTheme();
    const dColors = getColors(isDarkMode);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: dColors.background,
                    borderTopColor: isDarkMode ? 'transparent' : dColors.border,
                    height: Platform.OS === 'ios' ? 88 : 72,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
                    paddingTop: 12,
                    elevation: 0,
                },
                tabBarActiveTintColor: dColors.primary,
                tabBarInactiveTintColor: isDarkMode ? '#CBD5E1' : '#475569', // More visible inactive state
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.5} />,
                }}
            />
            {/* Community/Help - Standard Tab */}
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Assist',
                    tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} strokeWidth={2.5} />,
                }}
            />

            {/* Explore - Big Neon Theme Central Tab */}
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarButton: (props) => (
                        <View style={styles.exploreContainer}>
                            <TouchableOpacity {...props} activeOpacity={0.8} style={styles.touchableArea}>
                                <View style={styles.outerRing}>
                                    <LinearGradient
                                        colors={['#00f2ff', '#0066ff']}
                                        style={styles.gradientCircle}
                                    >
                                        <View style={styles.innerCircle}>
                                            <MaterialCommunityIcons name="compass-rose" size={32} color="white" />
                                        </View>
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={2.5} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.5} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    exploreContainer: {
        top: -20, // Floating effect
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchableArea: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerRing: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(0, 242, 255, 0.15)', // Very light neon shadow
        alignItems: 'center',
        justifyContent: 'center',
        // iOS Shadow
        shadowColor: "#00f2ff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        // Android Shadow
        elevation: 10,
    },
    gradientCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    innerCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#121B22', // Dark theme inner color
        alignItems: 'center',
        justifyContent: 'center',
    },
});
