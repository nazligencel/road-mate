import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, UserX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlockService } from '../services/api';

export default function BlockedUsersScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblocking, setUnblocking] = useState(null);

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const loadBlockedUsers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const users = await BlockService.getBlockedUsers(token);
                setBlockedUsers(users);
            }
        } catch (error) {
            console.error('Error loading blocked users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = (user) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${user.name || 'this user'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        setUnblocking(user.id);
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (token) {
                                const result = await BlockService.unblockUser(user.id, token);
                                if (result.success) {
                                    setBlockedUsers(prev => prev.filter(u => u.id !== user.id));
                                } else {
                                    Alert.alert('Error', result.error || 'Failed to unblock user');
                                }
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to unblock user');
                        } finally {
                            setUnblocking(null);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            {isDarkMode && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
            <View style={styles.userCardContent}>
                <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
                    <Text style={styles.blockedDate}>Blocked {formatDate(item.blockedAt)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.unblockBtn}
                    onPress={() => handleUnblock(item)}
                    disabled={unblocking === item.id}
                >
                    {unblocking === item.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={styles.unblockText}>Unblock</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Blocked Users</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : blockedUsers.length === 0 ? (
                <View style={styles.centerContainer}>
                    <UserX size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Blocked Users</Text>
                    <Text style={styles.emptySubtitle}>Users you block will appear here</Text>
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
    blockedDate: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    unblockBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    unblockText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
});
