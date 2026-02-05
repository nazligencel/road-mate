import { Tabs } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Compass, Wrench, MessageCircle, User } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
                tabBarInactiveTintColor: isDarkMode ? Colors.textSecondary + '80' : dColors.textSecondary,
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
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            {/* Community/Help - Standard Tab */}
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Assist',
                    tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
                }}
            />

            {/* Explore - Big Neon Theme Central Tab */}
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.centerButtonContainer}>
                            <LinearGradient
                                colors={[dColors.primary, isDarkMode ? '#45e3ff' : '#5AB2BF']} // Theme to Neon Cyan
                                style={styles.centerButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Compass color="#FFF" size={30} strokeWidth={2.5} />
                            </LinearGradient>
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButtonContainer: {
        top: -15, // Float slightly higher due to size
        shadowColor: '#45e3ff', // Neon Glow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    centerButton: {
        width: 60, // Bigger
        height: 60,
        borderRadius: 30, // Circle
        justifyContent: 'center',
        alignItems: 'center',
    },
});
