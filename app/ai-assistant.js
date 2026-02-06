import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getColors } from '../constants/Colors';
import { router } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIService } from '../services/api';

export default function AIAssistantScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro } = useSubscription();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [messages, setMessages] = useState([
        {
            id: '0',
            role: 'assistant',
            content: "Hi! I'm your RoadMate AI Assistant. Ask me about routes, vehicle maintenance, camping spots, weather, or any road trip questions!",
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!isPro) {
            router.replace('/paywall');
        }
    }, [isPro]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await AIService.chat(userMessage.content, token);

            if (response.requiresPro) {
                router.replace('/paywall');
                return;
            }

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.reply || 'Sorry, I could not process your request.',
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <View style={[styles.messageIcon, isUser ? styles.userIcon : styles.aiIcon]}>
                    {isUser ? <User color="#FFF" size={16} /> : <Bot color="#FFF" size={16} />}
                </View>
                <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                        {item.content}
                    </Text>
                </View>
            </View>
        );
    };

    if (!isPro) return null;

    return (
        <View style={styles.container}>
            {/* Header gradient */}
            <LinearGradient
                colors={['#8B5CF6', colors.background]}
                style={[StyleSheet.absoluteFill, { height: 200 }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                opacity={0.4}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Bot color="#8B5CF6" size={22} />
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
                <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {loading && (
                    <View style={styles.typingIndicator}>
                        <ActivityIndicator size="small" color="#8B5CF6" />
                        <Text style={styles.typingText}>AI is thinking...</Text>
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask me anything about the road..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        maxLength={500}
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={!input.trim() || loading}
                    >
                        <LinearGradient
                            colors={input.trim() && !loading ? ['#8B5CF6', '#6D28D9'] : [colors.border, colors.border]}
                            style={styles.sendBtnGradient}
                        >
                            <Send color="#FFF" size={18} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glassBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    proBadge: {
        backgroundColor: '#C5A059',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    proBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
        gap: 8,
    },
    userBubble: {
        flexDirection: 'row-reverse',
    },
    aiBubble: {},
    messageIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userIcon: {
        backgroundColor: colors.primary,
    },
    aiIcon: {
        backgroundColor: '#8B5CF6',
    },
    messageContent: {
        maxWidth: '78%',
        borderRadius: 16,
        padding: 12,
    },
    userContent: {
        backgroundColor: colors.primary,
        borderTopRightRadius: 4,
    },
    aiContent: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    aiText: {
        color: colors.text,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 15,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    sendBtn: {},
    sendBtnDisabled: {
        opacity: 0.5,
    },
    sendBtnGradient: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
