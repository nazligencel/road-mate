import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, MessageSquare, Clock, User, Bookmark, Send, MoreHorizontal, ThumbsUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { DiscussionService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiscussionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { discussions, savedIds, toggleSave } = useDiscussions();

    const [discussion, setDiscussion] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [sendingComment, setSendingComment] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadDiscussion = async () => {
            // Try API first
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const dto = await DiscussionService.getDiscussion(id, token);
                    setDiscussion({
                        id: dto.id,
                        title: dto.title,
                        preview: dto.description,
                        tag: dto.tag,
                        image: dto.image,
                        author: dto.creatorName || 'Unknown',
                        authorImage: dto.creatorImage,
                        time: dto.timeAgo || 'Just now',
                        replies: dto.commentCount || 0,
                    });

                    // Load comments from API
                    setLoadingComments(true);
                    const apiComments = await DiscussionService.getComments(id, token);
                    setComments(apiComments.map(c => ({
                        id: c.id,
                        author: c.authorName || 'Unknown',
                        authorImage: c.authorImage,
                        time: c.timeAgo || 'Just now',
                        text: c.text,
                    })));
                    setLoadingComments(false);
                    return;
                }
            } catch (error) {
                console.error('Failed to load discussion from API:', error);
            }

            // Fallback to local context
            const found = discussions.find(d => d.id == id);
            if (found) {
                setDiscussion(found);
                setComments([]);
            }
        };

        loadDiscussion();
    }, [id]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        setSendingComment(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const created = await DiscussionService.addComment(id, newComment, token);
                const mapped = {
                    id: created.id,
                    author: created.authorName || 'You',
                    authorImage: created.authorImage,
                    time: created.timeAgo || 'Just now',
                    text: created.text,
                    isOwn: true,
                };
                setComments(prev => [mapped, ...prev]);
                setNewComment('');
                Keyboard.dismiss();
                return;
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSendingComment(false);
        }

        // Fallback: local only
        const comment = {
            id: Date.now(),
            author: 'You',
            time: 'Just now',
            text: newComment,
            isOwn: true,
        };
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        Keyboard.dismiss();
    };

    if (!discussion) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 12 }}>Loading discussion...</Text>
            </View>
        );
    }

    const isBookmarked = savedIds.includes(Number(id)) || savedIds.includes(String(id));

    return (
        <View style={styles.container}>
            {/* ... Background ... */}
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={styles.headerActionBtn} onPress={() => toggleSave(discussion.id)}>
                        <Bookmark
                            color={isBookmarked ? colors.primary : colors.text}
                            fill={isBookmarked ? colors.primary : 'none'}
                            size={24}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <MoreHorizontal color={colors.text} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Tag */}
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{discussion.tag}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{discussion.title}</Text>

                {/* Author Info */}
                <View style={styles.metaRow}>
                    <View style={styles.authorContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <User size={16} color="#FFF" />
                        </View>
                        <Text style={styles.authorName}>{discussion.author}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.timeText}>{discussion.time}</Text>
                    </View>
                </View>

                {/* Image if exists */}
                {discussion.image && (
                    <Image source={{ uri: discussion.image }} style={styles.discussionImage} resizeMode="cover" />
                )}

                {/* Content */}
                <Text style={styles.content}>{discussion.preview}</Text>

                {/* Comments Section */}
                <Text style={styles.sectionTitle}>Comments</Text>
                {loadingComments ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.commentsList}>
                        {comments.length > 0 ? comments.map((comment) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <View style={styles.authorContainer}>
                                        <View style={[styles.avatarPlaceholder, { width: 32, height: 32, borderRadius: 16, backgroundColor: comment.isOwn ? colors.primary : colors.secondary }]}>
                                            <Text style={styles.avatarText}>{comment.author[0]}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.commentAuthor}>{comment.author}</Text>
                                            <Text style={styles.commentTime}>{comment.time}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.commentText}>{comment.text}</Text>
                            </View>
                        )) : (
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                No comments yet. Be the first to comment!
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Comment Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TextInput
                        placeholder="Add a comment..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.input}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!newComment.trim() || sendingComment) && { backgroundColor: colors.cardBorder }]}
                        onPress={handleSendComment}
                        disabled={!newComment.trim() || sendingComment}
                    >
                        {sendingComment ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={20} color="#FFF" />
                        )}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.glassBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    backBtn: {
        padding: 8,
    },
    headerActionBtn: {
        padding: 8,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    tagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    tagText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    discussionImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        paddingTop: 20,
    },
    commentsList: {
        gap: 16,
    },
    commentCard: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.glassBackground,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    commentAuthor: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 13,
    },
    commentTime: {
        color: colors.textSecondary,
        fontSize: 11,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    commentText: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        backgroundColor: colors.glassBackground,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        color: colors.text,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
