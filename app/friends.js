import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    RefreshControl,
} from 'react-native';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, UserCheck, UserX, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionService, BASE_URL } from '../services/api';

export default function FriendsScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const [connectionsData, pendingData] = await Promise.all([
                    ConnectionService.getMyConnections(token),
                    ConnectionService.getPendingRequests(token),
                ]);
                setFriends(connectionsData);
                setRequests(pendingData);
            }
        } catch (error) {
            console.error('Error loading friends data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const getImageUri = (user) => {
        const url = user?.profileImageUrl || user?.image;
        if (!url) return null;
        return url.startsWith('http') ? url : `${BASE_URL}${url}`;
    };

    const getFriendUser = (connection) => {
        // In a connection, the "other" user could be in user or connectedUser
        // We need to figure out which is the current user
        // Since we don't have current user ID here, we show connectedUser by default
        // The backend returns both sides, so we'll display the connectedUser
        return connection.connectedUser || connection.user;
    };

    const handleRemove = (connection) => {
        const friend = getFriendUser(connection);
        Alert.alert(
            'Remove Friend',
            `Are you sure you want to remove ${friend?.name || 'this user'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(connection.id);
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (token) {
                                const result = await ConnectionService.removeConnection(friend.id, token);
                                if (result.success) {
                                    setFriends(prev => prev.filter(c => c.id !== connection.id));
                                } else {
                                    Alert.alert('Error', result.message || 'Failed to remove friend');
                                }
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove friend');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    const handleAccept = async (connection) => {
        setActionLoading(connection.id);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const result = await ConnectionService.acceptConnection(connection.id, token);
                if (result.success) {
                    setRequests(prev => prev.filter(c => c.id !== connection.id));
                    loadData(); // Refresh to show in friends list
                } else {
                    Alert.alert('Error', result.message || 'Failed to accept request');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to accept request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (connection) => {
        setActionLoading(connection.id);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const result = await ConnectionService.rejectConnection(connection.id, token);
                if (result.success) {
                    setRequests(prev => prev.filter(c => c.id !== connection.id));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const renderFriendItem = ({ item }) => {
        const friend = getFriendUser(item);
        const avatarUri = getImageUri(friend);

        return (
            <TouchableOpacity
                style={styles.userCard}
                onPress={() => router.push({ pathname: '/user-profile', params: { id: friend?.id } })}
            >
                {isDarkMode && Platform.OS === 'ios' && (
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <View style={styles.userCardContent}>
                    <Image
                        source={{ uri: avatarUri || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{friend?.name || 'Unknown User'}</Text>
                        {friend?.route ? (
                            <View style={styles.routeRow}>
                                <Navigation size={12} color={colors.primary} />
                                <Text style={styles.routeText} numberOfLines={1}>{friend.route}</Text>
                            </View>
                        ) : (
                            <Text style={styles.statusText}>{friend?.status || 'Active'}</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemove(item)}
                        disabled={actionLoading === item.id}
                    >
                        {actionLoading === item.id ? (
                            <ActivityIndicator size="small" color="#e11d48" />
                        ) : (
                            <Text style={styles.removeBtnText}>Remove</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderRequestItem = ({ item }) => {
        const sender = item.user;
        const avatarUri = getImageUri(sender);

        return (
            <View style={styles.userCard}>
                {isDarkMode && Platform.OS === 'ios' && (
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <View style={styles.userCardContent}>
                    <Image
                        source={{ uri: avatarUri || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{sender?.name || 'Unknown User'}</Text>
                        <Text style={styles.statusText}>Wants to connect</Text>
                    </View>
                    <View style={styles.requestActions}>
                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleAccept(item)}
                            disabled={actionLoading === item.id}
                        >
                            {actionLoading === item.id ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <UserCheck size={18} color="#FFF" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleReject(item)}
                            disabled={actionLoading === item.id}
                        >
                            <UserX size={18} color="#e11d48" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const currentData = activeTab === 'friends' ? friends : requests;

    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>
            <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Friends</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                        Friends ({friends.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                        Requests ({requests.length})
                    </Text>
                    {requests.length > 0 && <View style={styles.badge} />}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : currentData.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Users size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>
                        {activeTab === 'friends' ? 'No Friends Yet' : 'No Pending Requests'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {activeTab === 'friends'
                            ? 'Connect with other nomads from profiles or the map'
                            : 'Friend requests will appear here'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={activeTab === 'friends' ? renderFriendItem : renderRequestItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: '#FFF',
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e11d48',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 12,
        backgroundColor: isDarkMode
            ? Platform.select({ ios: 'transparent', android: 'rgba(255, 255, 255, 0.05)' })
            : colors.card,
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    routeText: {
        fontSize: 12,
        color: colors.primary,
        flex: 1,
    },
    statusText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    removeBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e11d48',
    },
    removeBtnText: {
        color: '#e11d48',
        fontSize: 13,
        fontWeight: '600',
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e11d48',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
