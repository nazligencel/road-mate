import { View, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { ArrowLeft, Send, Phone, Video, MoreVertical, ShieldOff, ShieldBan } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageService, BlockService } from '../../services/api';

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatDetailScreen() {
    const { id, name, avatar } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isBlockedByThem, setIsBlockedByThem] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const flatListRef = useRef(null);

    // Check block status on mount
    useEffect(() => {
        const checkBlockStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const result = await BlockService.checkBlocked(id, token);
                    setIsBlocked(result.isBlocked);
                    setIsBlockedByThem(result.isBlockedByThem);
                }
            } catch (error) {
                console.error('Error checking block status:', error);
            }
        };
        checkBlockStatus();
    }, [id]);

    const handleBlock = async () => {
        setShowMenu(false);
        Alert.alert(
            'Block User',
            `Are you sure you want to block ${name || 'this user'}? They won't be able to message you.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (token) {
                                const result = await BlockService.blockUser(id, token);
                                if (result.success) {
                                    setIsBlocked(true);
                                }
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to block user');
                        }
                    }
                }
            ]
        );
    };

    const handleUnblock = async () => {
        setShowMenu(false);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const result = await BlockService.unblockUser(id, token);
                if (result.success) {
                    setIsBlocked(false);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to unblock user');
        }
    };

    const loadMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const data = await MessageService.getConversation(id, token);
                setMessages(data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;

        setSending(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const sentMessage = await MessageService.sendMessage(id, inputText.trim(), token);
                setMessages((prev) => [...prev, sentMessage]);
                setInputText('');
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

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

            <SafeAreaView edges={['top']} style={styles.headerContainer}>
                <View style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Image
                            source={{ uri: avatar || 'https://via.placeholder.com/100' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={[styles.name, { color: colors.text }]}>{name || 'Nomad'}</Text>
                            <Text style={[styles.status, { color: colors.online }]}>Online</Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Phone size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Video size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setShowMenu(true)}>
                            <MoreVertical size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Block Banner */}
            {isBlocked && (
                <View style={[styles.blockBanner, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2' }]}>
                    <ShieldBan size={16} color="#EF4444" />
                    <Text style={[styles.blockBannerText, { color: '#EF4444' }]}>You blocked this user</Text>
                    <TouchableOpacity onPress={handleUnblock}>
                        <Text style={[styles.unblockLink, { color: colors.primary }]}>Unblock</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isBlockedByThem && !isBlocked && (
                <View style={[styles.blockBanner, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2' }]}>
                    <ShieldOff size={16} color="#EF4444" />
                    <Text style={[styles.blockBannerText, { color: '#EF4444' }]}>You can't reply to this conversation</Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.messageList}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No messages yet. Say hello!
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageBubble,
                        item.isMine ? styles.myMessage : styles.theirMessage,
                        item.isMine
                            ? { backgroundColor: colors.primary }
                            : { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }
                    ]}>
                        <Text style={[
                            styles.messageText,
                            { color: item.isMine ? '#FFF' : colors.text }
                        ]}>{item.content}</Text>
                        <Text style={[
                            styles.messageTime,
                            { color: item.isMine ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                        ]}>{formatTime(item.createdAt)}</Text>
                    </View>
                )}
            />
            )}

            {!(isBlocked || isBlockedByThem) && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    style={[styles.inputContainer, {
                        backgroundColor: isDarkMode ? '#1e293b' : '#FFF',
                        borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }]}
                >
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9',
                            color: colors.text
                        }]}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, { backgroundColor: colors.primary }]}
                    >
                        <Send size={20} color="#FFF" />
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )}

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={[styles.menuContainer, {
                        backgroundColor: isDarkMode ? '#334155' : '#FFF',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }]}>
                        {isBlocked ? (
                            <TouchableOpacity style={styles.menuOption} onPress={handleUnblock}>
                                <ShieldOff size={18} color={colors.primary} />
                                <Text style={[styles.menuOptionText, { color: colors.text }]}>Unblock User</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.menuOption} onPress={handleBlock}>
                                <ShieldBan size={18} color="#EF4444" />
                                <Text style={[styles.menuOptionText, { color: '#EF4444' }]}>Block User</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
    },
    headerContainer: {
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 8,
    },
    messageList: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blockBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    blockBannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    unblockLink: {
        fontSize: 13,
        fontWeight: '600',
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 110,
        paddingRight: 16,
    },
    menuContainer: {
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 180,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuOptionText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
