import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
    Platform, RefreshControl, Modal, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';
import { router } from 'expo-router';
import {
    ArrowLeft, Plus, MapPin, Clock, CheckCircle, AlertCircle,
    Send, MessageSquare, X, User, AlertTriangle, Crown
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AssistService, SOSService } from '../services/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import * as Location from 'expo-location';

export default function AssistScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro } = useSubscription();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [requests, setRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('open');
    const [sosActive, setSosActive] = useState(false);
    const [sosLoading, setSosLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const handleSOS = async () => {
        if (!isPro) {
            router.push('/paywall');
            return;
        }
        setSosLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (sosActive) {
                const result = await SOSService.deactivate(token);
                if (result.success) setSosActive(false);
                setSosLoading(false);
            } else {
                Alert.alert(
                    'Activate SOS',
                    'This will alert nearby users that you need roadside help. Continue?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setSosLoading(false) },
                        {
                            text: 'Activate SOS',
                            style: 'destructive',
                            onPress: async () => {
                                const result = await SOSService.activate(token);
                                if (result.success) setSosActive(true);
                                setSosLoading(false);
                            }
                        }
                    ]
                );
                return;
            }
        } catch (error) {
            console.error('SOS error:', error);
            setSosLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        getUserLocation();
    }, [filter]);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation(location.coords);
            }
        } catch (e) {
            console.log('Location error:', e.message);
        }
    };

    const loadRequests = async () => {
        try {
            const data = await AssistService.list(filter);
            setRequests(data);
        } catch (error) {
            console.error('Load requests error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    }, [filter]);

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Required', 'Please enter a title for your request.');
            return;
        }

        setCreating(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await AssistService.create({
                title: newTitle.trim(),
                description: newDescription.trim(),
                latitude: userLocation?.latitude,
                longitude: userLocation?.longitude,
            }, token);

            setNewTitle('');
            setNewDescription('');
            setShowCreateModal(false);
            loadRequests();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setCreating(false);
        }
    };

    const openDetail = async (request) => {
        try {
            const detail = await AssistService.getDetail(request.id);
            setSelectedRequest(detail);
            setShowDetailModal(true);
        } catch (error) {
            Alert.alert('Error', 'Could not load request details.');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sendingMessage) return;

        setSendingMessage(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const msg = await AssistService.addMessage(selectedRequest.id, newMessage.trim(), token);
            setSelectedRequest(prev => ({
                ...prev,
                messages: [...(prev.messages || []), msg]
            }));
            setNewMessage('');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleResolve = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await AssistService.resolve(selectedRequest.id, token);
            setSelectedRequest(prev => ({ ...prev, status: 'resolved' }));
            loadRequests();
        } catch (error) {
            Alert.alert('Error', 'Could not resolve request.');
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={[colors.primary, colors.background]}
                style={[StyleSheet.absoluteFill, { height: 300 }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                opacity={0.6}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Road Assist</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createBtn}>
                    <LinearGradient colors={[colors.primary, colors.online]} style={styles.createBtnGradient}>
                        <Plus color="#FFF" size={20} strokeWidth={3} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* SOS Banner - Pro Feature */}
            <TouchableOpacity
                style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
                onPress={handleSOS}
                disabled={sosLoading}
                activeOpacity={0.7}
            >
                <View style={[styles.sosIconContainer, sosActive && styles.sosIconActive]}>
                    <AlertTriangle size={20} color={sosActive ? '#FFF' : '#EF4444'} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.sosTitle, sosActive && { color: '#EF4444' }]}>
                        {sosActive ? 'SOS Active — Nearby users are alerted' : 'Emergency SOS'}
                    </Text>
                    <Text style={styles.sosSubtitle}>
                        {sosActive ? 'Tap to deactivate' : 'Alert nearby users you need roadside help'}
                    </Text>
                </View>
                {!isPro && (
                    <View style={styles.sosPro}>
                        <Crown size={12} color="#C5A059" />
                        <Text style={styles.sosProText}>PRO</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                {['open', 'resolved'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        {f === 'open' ? <AlertCircle size={14} color={filter === f ? '#FFF' : colors.textSecondary} /> : <CheckCircle size={14} color={filter === f ? '#FFF' : colors.textSecondary} />}
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Requests list */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MapPin color={colors.textSecondary} size={48} />
                        <Text style={styles.emptyTitle}>No {filter} requests</Text>
                        <Text style={styles.emptySubtitle}>Be the first to ask for help or offer assistance!</Text>
                    </View>
                ) : (
                    requests.map(req => (
                        <TouchableOpacity key={req.id} onPress={() => openDetail(req)} activeOpacity={0.7}>
                            <View style={styles.requestCard}>
                                <BlurView intensity={15} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                                <View style={styles.requestContent}>
                                    <View style={styles.requestHeader}>
                                        <View style={[styles.statusBadge, req.status === 'resolved' ? styles.resolvedBadge : styles.openBadge]}>
                                            <Text style={styles.statusText}>{req.status}</Text>
                                        </View>
                                        <View style={styles.timeRow}>
                                            <Clock size={12} color={colors.textSecondary} />
                                            <Text style={styles.timeText}>{formatTime(req.createdAt)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.requestTitle}>{req.title}</Text>
                                    {req.description ? (
                                        <Text style={styles.requestDescription} numberOfLines={2}>{req.description}</Text>
                                    ) : null}
                                    <View style={styles.requestFooter}>
                                        <View style={styles.authorRow}>
                                            <View style={styles.authorAvatar}>
                                                <User size={12} color="#FFF" />
                                            </View>
                                            <Text style={styles.authorName}>{req.userName || 'Anonymous'}</Text>
                                        </View>
                                        {req.latitude && (
                                            <View style={styles.locationRow}>
                                                <MapPin size={12} color={colors.textSecondary} />
                                                <Text style={styles.locationText}>
                                                    {req.latitude.toFixed(2)}, {req.longitude.toFixed(2)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Create Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Assist Request</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <X color={colors.text} size={24} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="What do you need help with?"
                                placeholderTextColor={colors.textSecondary}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                maxLength={100}
                            />
                            <TextInput
                                style={[styles.modalInput, styles.modalTextArea]}
                                placeholder="Describe your situation in detail..."
                                placeholderTextColor={colors.textSecondary}
                                value={newDescription}
                                onChangeText={setNewDescription}
                                multiline
                                maxLength={500}
                                textAlignVertical="top"
                            />

                            {userLocation && (
                                <View style={styles.locationInfo}>
                                    <MapPin size={14} color={colors.primary} />
                                    <Text style={styles.locationInfoText}>
                                        Your location will be shared ({userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)})
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.createSubmitBtn}
                                onPress={handleCreate}
                                disabled={creating}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.online]}
                                    style={styles.createSubmitGradient}
                                >
                                    {creating ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.createSubmitText}>Create Request</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Detail Modal */}
            <Modal visible={showDetailModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.detailModalContainer}>
                        <View style={styles.detailModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle} numberOfLines={1}>{selectedRequest?.title}</Text>
                                <TouchableOpacity onPress={() => { setShowDetailModal(false); setSelectedRequest(null); }}>
                                    <X color={colors.text} size={24} />
                                </TouchableOpacity>
                            </View>

                            {selectedRequest && (
                                <>
                                    <View style={styles.detailMeta}>
                                        <View style={[styles.statusBadge, selectedRequest.status === 'resolved' ? styles.resolvedBadge : styles.openBadge]}>
                                            <Text style={styles.statusText}>{selectedRequest.status}</Text>
                                        </View>
                                        <Text style={styles.detailAuthor}>by {selectedRequest.userName}</Text>
                                    </View>

                                    {selectedRequest.description ? (
                                        <Text style={styles.detailDescription}>{selectedRequest.description}</Text>
                                    ) : null}

                                    {/* Messages */}
                                    <View style={styles.messagesSection}>
                                        <Text style={styles.messagesTitle}>
                                            <MessageSquare size={14} color={colors.text} /> Responses ({selectedRequest.messages?.length || 0})
                                        </Text>
                                        <FlatList
                                            data={selectedRequest.messages || []}
                                            keyExtractor={item => item.id.toString()}
                                            style={styles.messagesList}
                                            renderItem={({ item }) => (
                                                <View style={styles.messageItem}>
                                                    <View style={styles.messageAvatar}>
                                                        <User size={12} color="#FFF" />
                                                    </View>
                                                    <View style={styles.messageBody}>
                                                        <Text style={styles.messageName}>{item.userName}</Text>
                                                        <Text style={styles.messageContent}>{item.content}</Text>
                                                        <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
                                                    </View>
                                                </View>
                                            )}
                                            ListEmptyComponent={
                                                <Text style={styles.noMessages}>No responses yet. Be the first to help!</Text>
                                            }
                                        />
                                    </View>

                                    {/* Reply input */}
                                    {selectedRequest.status === 'open' && (
                                        <View style={styles.replyContainer}>
                                            <TextInput
                                                style={styles.replyInput}
                                                placeholder="Write a response or solution..."
                                                placeholderTextColor={colors.textSecondary}
                                                value={newMessage}
                                                onChangeText={setNewMessage}
                                                multiline
                                                maxLength={500}
                                            />
                                            <TouchableOpacity
                                                onPress={handleSendMessage}
                                                disabled={!newMessage.trim() || sendingMessage}
                                                style={styles.replySendBtn}
                                            >
                                                {sendingMessage ? (
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                ) : (
                                                    <Send size={20} color={newMessage.trim() ? colors.primary : colors.textSecondary} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Resolve button */}
                                    {selectedRequest.status === 'open' && (
                                        <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
                                            <CheckCircle size={16} color="#10B981" />
                                            <Text style={styles.resolveBtnText}>Mark as Resolved</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingHorizontal: 16, paddingBottom: 12,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glassBackground,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    createBtn: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
    createBtnGradient: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    sosBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginHorizontal: 16, marginBottom: 12, padding: 14,
        borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    sosBannerActive: {
        borderColor: '#EF4444', borderWidth: 2, backgroundColor: '#EF444410',
    },
    sosIconContainer: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#EF444420', justifyContent: 'center', alignItems: 'center',
    },
    sosIconActive: { backgroundColor: '#EF4444' },
    sosTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    sosSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    sosPro: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#C5A05915', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    sosProText: { color: '#C5A059', fontSize: 11, fontWeight: '700' },
    filterRow: {
        flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12,
    },
    filterTab: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.glassBackground, borderWidth: 1, borderColor: colors.cardBorder,
    },
    filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    filterTextActive: { color: '#FFF' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    requestCard: {
        borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground, overflow: 'hidden',
    },
    requestContent: { padding: 16 },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    openBadge: { backgroundColor: '#EF444420' },
    resolvedBadge: { backgroundColor: '#10B98120' },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: colors.text },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12, color: colors.textSecondary },
    requestTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    requestDescription: { fontSize: 14, color: colors.text, opacity: 0.8, lineHeight: 20, marginBottom: 12 },
    requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 10 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    authorAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    authorName: { fontSize: 13, color: colors.text, fontWeight: '500' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 11, color: colors.textSecondary },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContainer: { maxHeight: '80%' },
    modalContent: {
        backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 12 },
    modalInput: {
        backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
        color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 12,
    },
    modalTextArea: { height: 100, textAlignVertical: 'top' },
    locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    locationInfoText: { fontSize: 12, color: colors.textSecondary },
    createSubmitBtn: { marginTop: 4 },
    createSubmitGradient: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    createSubmitText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    // Detail modal
    detailModalContainer: { maxHeight: '90%' },
    detailModalContent: {
        backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '100%',
    },
    detailMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    detailAuthor: { fontSize: 13, color: colors.textSecondary },
    detailDescription: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 16 },
    messagesSection: { flex: 1, marginBottom: 12 },
    messagesTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 },
    messagesList: { maxHeight: 250 },
    messageItem: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    messageAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    messageBody: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.cardBorder },
    messageName: { fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: 2 },
    messageContent: { fontSize: 14, color: colors.text, lineHeight: 20 },
    messageTime: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
    noMessages: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 20 },
    replyContainer: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 8,
        borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 12,
    },
    replyInput: {
        flex: 1, backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
        color: colors.text, fontSize: 14, maxHeight: 80, borderWidth: 1, borderColor: colors.cardBorder,
    },
    replySendBtn: { padding: 8 },
    resolveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 12, marginTop: 8, borderRadius: 12,
        backgroundColor: '#10B98115', borderWidth: 1, borderColor: '#10B98140',
    },
    resolveBtnText: { fontSize: 14, fontWeight: '600', color: '#10B981' },
});
