import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Colors, getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CHATS = [
    {
        id: '1',
        user: 'Jessica',
        lastMessage: 'I love that van build! How long did it take?',
        time: '2m',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        unread: 2,
        online: true,
    },
    {
        id: '2',
        user: 'Mike_Builds',
        lastMessage: 'Do you use a Victron controller?',
        time: '1h',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
        unread: 0,
        online: true,
    },
    {
        id: '3',
        user: 'Sarah_Nomad',
        lastMessage: 'The sunset at that spot was amazing!',
        time: '3h',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
        unread: 1,
        online: false,
    },
    {
        id: '4',
        user: 'Tom_Traveler',
        lastMessage: 'Thanks for the camping tips!',
        time: '1d',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        unread: 0,
        online: false,
    },
    {
        id: '5',
        user: 'Emily_Explorer',
        lastMessage: 'Catch you at the meetup next week?',
        time: '2d',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
        unread: 0,
        online: true,
    },
];

export default function ChatScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background Gradient - Dark mode only */}
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
                <TouchableOpacity style={[styles.searchBtn, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                    <Search size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={CHATS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.chatCard, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: item.image }} style={styles.avatar} />
                            {item.online && <View style={[styles.onlineBadge, { backgroundColor: colors.online, borderColor: colors.background }]} />}
                        </View>
                        <View style={styles.chatContent}>
                            <View style={styles.topRow}>
                                <Text style={[styles.name, { color: colors.text }]}>{item.user}</Text>
                                <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
                            </View>
                            <View style={styles.bottomRow}>
                                <Text
                                    style={[styles.message, { color: colors.textSecondary }, item.unread > 0 && { color: colors.text, fontWeight: '500' }]}
                                    numberOfLines={1}
                                >
                                    {item.lastMessage}
                                </Text>
                                {item.unread > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.badgeText}>{item.unread}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MessageCircle size={60} color={colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
                        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                            Connect with other nomads to start chatting
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    searchBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        paddingHorizontal: 20,
    },
    chatCard: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.online || '#10B981',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    time: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    message: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    unreadMessage: {
        color: Colors.text,
        fontWeight: '500',
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6, // Changed from padding 6 to paddingHorizontal for better pill shape
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 20,
    },
    emptyDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
