import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Search } from 'lucide-react-native';

const CHATS = [
    {
        id: '1',
        user: 'Jessica',
        lastMessage: 'I love that van build! How long did it take?',
        time: '2m',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        unread: 2,
    },
    {
        id: '2',
        user: 'Mike_Builds',
        lastMessage: 'Do you use a Victron controller?',
        time: '1h',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
        unread: 0,
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
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.chatItem}>
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                        <View style={styles.chatContent}>
                            <View style={styles.topRow}>
                                <Text style={styles.name}>{item.user}</Text>
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                            <Text style={[styles.message, item.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    searchBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.card,
    },
    list: {
        padding: 16,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
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
        fontWeight: '600',
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
