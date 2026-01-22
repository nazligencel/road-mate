import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';

// Forced reload check
export default function TabLayout() {
    console.log("Tab Layout initialized!");
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopColor: 'transparent',
                    height: Platform.OS === 'ios' ? 88 : 72,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
                    paddingTop: 12,
                    elevation: 0,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary + '80', // Soft green-gray with alpha
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
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
                }}
            />

            {/* Middle "Plus" Button - Custom Tab */}
            <Tabs.Screen
                name="community"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.plusButton}>
                            <Plus color="#FFFFFF" size={28} />
                        </View>
                    ),
                    tabBarLabel: () => null, // Hide label
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
    plusButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24, // Lift it up
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
});
