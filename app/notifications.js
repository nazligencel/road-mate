import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, MessageSquare, Users, MapPin, Calendar, UserPlus, UserCheck, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationService } from '../services/api';

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const getNotificationIcon = (type, colors) => {
    switch (type) {
        case 'MESSAGE':
            return <MessageSquare size={20} color={colors.primary} />;
        case 'MEETING_REQUEST':
            return <MapPin size={20} color="#e11d48" />;
        case 'NEW_ACTIVITY':
            return <Calendar size={20} color="#22c55e" />;
        case 'ACTIVITY_JOIN':
            return <Users size={20} color="#3b82f6" />;
        case 'FRIEND_REQUEST':
            return <UserPlus size={20} color="#a855f7" />;
        case 'FRIEND_ACCEPTED':
            return <UserCheck size={20} color="#22c55e" />;
        case 'ROUTE_UPDATE':
            return <Navigation size={20} color="#f97316" />;
        default:
            return <Bell size={20} color={colors.primary} />;
    }
};

export default function NotificationsScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const data = await NotificationService.getNotifications(token);
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                await NotificationService.markAllAsRead(token);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationPress = (notification) => {
        // Parse senderId from data if available
        let senderId = notification.senderId;
        if (!senderId && notification.data) {
            try {
                const parsed = JSON.parse(notification.data);
                senderId = parsed.senderId;
            } catch (e) {}
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'MESSAGE':
                if (senderId) {
                    router.push({
                        pathname: `/chat/${senderId}`,
                        params: { name: notification.senderName, avatar: notification.senderImage }
                    });
                }
                break;
            case 'MEETING_REQUEST':
                router.push('/(tabs)/explore');
                break;
            case 'NEW_ACTIVITY':
            case 'ACTIVITY_JOIN':
                router.push('/(tabs)/home');
                break;
            case 'FRIEND_REQUEST':
                router.push('/friends');
                break;
            case 'FRIEND_ACCEPTED':
                if (senderId) {
                    router.push({ pathname: '/user-profile', params: { id: senderId } });
                }
                break;
            case 'ROUTE_UPDATE':
                if (senderId) {
                    router.push({ pathname: '/user-profile', params: { id: senderId } });
                }
                break;
            default:
                break;
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                {
                    backgroundColor: item.isRead
                        ? (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                        : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                {item.senderImage ? (
                    <Image source={{ uri: item.senderImage }} style={styles.senderImage} />
                ) : (
                    getNotificationIcon(item.type, colors)
                )}
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {formatTime(item.createdAt)}
                </Text>
            </View>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={[styles.markReadText, { color: colors.primary }]}>Mark all read</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={renderNotification}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Bell size={60} color={colors.textSecondary} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    You're all caught up!
                                </Text>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    markReadText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    senderImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    time: {
        fontSize: 11,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 14,
        marginTop: 8,
    },
});
