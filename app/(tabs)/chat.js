import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Colors, getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageService } from '../../services/api';

// Helper to format time
const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
};

export default function ChatScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadConversations = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const data = await MessageService.getConversations(token);
                setConversations(data);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reload when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Gradient Glow matching Profile */}
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>
            {/* Main Background */}
            <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
                <TouchableOpacity
                    style={[styles.searchBtn, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
                    onPress={() => alert('Search feature coming soon!')}
                >
                    <Search size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.odUserId?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.chatCard, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
                            onPress={() => router.push({
                                pathname: `/chat/${item.odUserId}`,
                                params: { name: item.otherUserName, avatar: item.otherUserImage }
                            })}
                        >
                            <View style={styles.avatarContainer}>
                                <Image source={{ uri: item.otherUserImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                                {item.otherUserOnline && <View style={[styles.onlineBadge, { backgroundColor: colors.online, borderColor: colors.background }]} />}
                            </View>
                            <View style={styles.chatContent}>
                                <View style={styles.topRow}>
                                    <Text style={[styles.name, { color: colors.text }]}>{item.otherUserName}</Text>
                                    <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.lastMessageTime)}</Text>
                                </View>
                                <View style={styles.bottomRow}>
                                    <Text
                                        style={[styles.message, { color: colors.textSecondary }, item.unreadCount > 0 && { color: colors.text, fontWeight: '500' }]}
                                        numberOfLines={1}
                                    >
                                        {item.lastMessage}
                                    </Text>
                                    {item.unreadCount > 0 && (
                                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
