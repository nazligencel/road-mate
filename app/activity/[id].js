import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Calendar, Clock, User as UserIcon, AlertCircle, Pencil } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { ActivityService, UserService, BASE_URL } from '../../services/api';

export default function ActivityDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const [user, activityData] = await Promise.all([
                UserService.getUserDetails(token),
                ActivityService.getActivity(id, token)
            ]);

            setCurrentUser(user);

            // Check if activityData is dummy? No, backend now returns data.
            // But if id starts with 'dummy', we handle gracefully or let it fail?
            // Since we routed from home with real or dummy IDs.
            // If dummy ID, getActivity might fail or returns 404.
            // For now assume real ID or handle error.

            setActivity(activityData);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load activity details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        Alert.alert(
            "Cancel Activity",
            "Are you sure you want to cancel this activity? This cannot be undone.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await ActivityService.cancelActivity(id, token);
                            Alert.alert('Success', 'Activity cancelled');
                            loadData(); // Reload to show cancelled status
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel activity');
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!activity) return null;

    const isCreator = currentUser?.id === activity.creatorId;
    const isCancelled = activity.status === 'CANCELLED';
    const isPast = activity.isPast;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: activity.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>

                    {/* Status Badge */}
                    {isCancelled && (
                        <View style={styles.cancelledBadge}>
                            <AlertCircle size={16} color="#FFF" />
                            <Text style={styles.cancelledText}>CANCELLED</Text>
                        </View>
                    )}
                    {isPast && !isCancelled && (
                        <View style={styles.pastBadge}>
                            <Clock size={16} color="#FFF" />
                            <Text style={styles.pastBadgeText}>PAST EVENT</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{activity.title}</Text>

                    {/* Meta Info */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Calendar size={16} color={colors.primary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{activity.date}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={16} color={colors.primary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{activity.time}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MapPin size={16} color={colors.primary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{activity.location}</Text>
                        </View>
                    </View>

                    {/* Creator */}
                    <View style={[styles.creatorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Image source={{ uri: (() => {
                            const img = activity.creatorImageUrl || activity.creatorProfileImageUrl || activity.creatorImage;
                            if (!img) return 'https://via.placeholder.com/40';
                            return img.startsWith('http') ? img : `${BASE_URL}${img}`;
                        })() }} style={styles.creatorImage} />
                        <View>
                            <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>Hosted by</Text>
                            <Text style={[styles.creatorName, { color: colors.text }]}>{activity.creatorName}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>About this activity</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {activity.description || 'No description provided.'}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actionContainer}>
                        {isCancelled ? (
                            <View style={[styles.statusMessage, { backgroundColor: colors.error + '20' }]}>
                                <Text style={[styles.statusText, { color: colors.error }]}>This activity has been cancelled by the host.</Text>
                            </View>
                        ) : isPast ? (
                            <View style={[styles.statusMessage, { backgroundColor: colors.textSecondary + '20' }]}>
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>This activity has already taken place.</Text>
                            </View>
                        ) : isCreator ? (
                            <View style={{ width: '100%', gap: 12 }}>
                                <TouchableOpacity
                                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                                    onPress={() => router.push('/edit-activity?id=' + id)}
                                >
                                    <Pencil size={18} color="#FFF" />
                                    <Text style={styles.editButtonText}>Edit Activity</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { borderColor: colors.error }]}
                                    onPress={handleCancel}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <ActivityIndicator color={colors.error} />
                                    ) : (
                                        <Text style={[styles.cancelButtonText, { color: colors.error }]}>Cancel Activity</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.joinButton, { backgroundColor: colors.primary }]}>
                                <Text style={styles.joinButtonText}>Join Activity</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: 300,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelledBadge: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#EF4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cancelledText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pastBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(107,114,128,0.85)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pastBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        backgroundColor: 'transparent', // Handled by container bg
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
    },
    creatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    creatorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    creatorLabel: {
        fontSize: 12,
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    actionContainer: {
        alignItems: 'center',
    },
    joinButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    editButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusMessage: {
        padding: 16,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    statusText: {
        fontWeight: '600',
    }
});
