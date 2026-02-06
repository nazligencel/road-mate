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
                const token = await AsyncStorage.getItem('token');
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
            const token = await AsyncStorage.getItem('token');
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

    return (
        <View style={styles.container}>
            {/* Background */}
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
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Discussion</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <MoreHorizontal color={colors.text} size={24} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Discussion Post */}
                    <View style={styles.postCard}>
                        {/* Header: Author & Time */}
                        <View style={styles.postHeader}>
                            <View style={styles.authorContainer}>
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>{discussion.author[0]}</Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>{discussion.author}</Text>
                                    <Text style={styles.postTime}>{discussion.time}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => toggleSave(discussion.id)}>
                                <Bookmark
                                    size={24}
                                    color={savedIds.includes(discussion.id) ? colors.primary : colors.textSecondary}
                                    fill={savedIds.includes(discussion.id) ? colors.primary : 'none'}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Title & Tag */}
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>{discussion.tag}</Text>
                        </View>
                        <Text style={styles.postTitle}>{discussion.title}</Text>

                        {/* Content */}
                        <Text style={styles.postBody}>{discussion.preview}</Text>

                        {/* Optional Image */}
                        {discussion.image && (
                            <Image source={{ uri: discussion.image }} style={styles.postImage} />
                        )}

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <MessageSquare size={16} color={colors.textSecondary} />
                                <Text style={styles.statText}>{comments.length} Comments</Text>
                            </View>
                        </View>
                    </View>

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

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        placeholder="Write a comment..."
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
    iconBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    postCard: {
        padding: 24,
        borderBottomWidth: 8,
        borderBottomColor: colors.glassBackground,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    authorName: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    postTime: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    tagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: colors.glassBackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    tagText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    postTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        lineHeight: 30,
    },
    postBody: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        marginBottom: 20,
        opacity: 0.9,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 16,
    },
    commentsList: {
        paddingHorizontal: 24,
        gap: 16,
    },
    commentCard: {
        backgroundColor: colors.glassBackground,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    commentHeader: {
        marginBottom: 10,
    },
    commentAuthor: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    commentTime: {
        color: colors.textSecondary,
        fontSize: 11,
    },
    commentText: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    inputBar: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        backgroundColor: colors.background,
        gap: 12,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: colors.glassBackground,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: colors.text,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
