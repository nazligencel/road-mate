import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Search, MessageCircle } from 'lucide-react-native';

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
    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.searchBtn}>
                    <Search size={20} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={CHATS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.chatCard}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: item.image }} style={styles.avatar} />
                            {item.online && <View style={styles.onlineBadge} />}
                        </View>
                        <View style={styles.chatContent}>
                            <View style={styles.topRow}>
                                <Text style={styles.name}>{item.user}</Text>
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                            <Text
                                style={[styles.message, item.unread > 0 && styles.unreadMessage]}
                                numberOfLines={1}
                            >
                                {item.lastMessage}
                            </Text>
                        </View>
                        {item.unread > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.unread}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <MessageCircle size={60} color={Colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No messages yet</Text>
                        <Text style={styles.emptyDesc}>
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
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    list: {
        padding: 16,
        gap: 12,
    },
    chatCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 14,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.online,
        borderWidth: 2,
        borderColor: '#0A0A1A',
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    time: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    message: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    unreadMessage: {
        color: Colors.text,
        fontWeight: '500',
    },
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 10,
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
