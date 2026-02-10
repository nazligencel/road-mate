import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Bookmark, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useDiscussions } from '../contexts/DiscussionContext';
import { BASE_URL } from '../services/api';

const GlassCard = ({ children, style, intensity = 20, tint = 'dark' }) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
        <View style={{ padding: 16 }}>
            {children}
        </View>
    </View>
);

export default function SavedDiscussionsScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { discussions, savedIds, toggleSave } = useDiscussions();

    const savedDiscussions = discussions.filter(item => savedIds.includes(item.id));

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
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
                <Text style={styles.headerTitle}>Bookmarks</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {savedDiscussions.length > 0 ? (
                    savedDiscussions.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => router.push(`/discussion/${item.id}`)}>
                            <GlassCard style={styles.discussionCard} tint={isDarkMode ? 'dark' : 'light'}>
                                <View style={styles.discussionHeader}>
                                    <View style={styles.tagBadge}>
                                        <Text style={styles.tagText}>{item.tag}</Text>
                                    </View>

                                    {/* Bookmark Icon - Filled since it is in saved list */}
                                    <TouchableOpacity style={styles.bookmarkBtn} onPress={() => toggleSave(item.id)}>
                                        <Bookmark
                                            size={20}
                                            color={colors.primary}
                                            fill={colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                                <Text style={styles.discussionTitle}>{item.title}</Text>
                                <Text style={styles.discussionPreview}>{item.preview}</Text>

                                <View style={styles.discussionFooter}>
                                    <View style={styles.authorRow}>
                                        {item.authorImage ? (
                                            <Image source={{ uri: item.authorImage.startsWith('http') ? item.authorImage : `${BASE_URL}${item.authorImage}` }} style={styles.avatarImage} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder} />
                                        )}
                                        <Text style={styles.authorName}>{item.author}</Text>
                                    </View>
                                    <View style={styles.statsRow}>
                                        <MessageSquare size={14} color={colors.textSecondary} />
                                        <Text style={styles.statsText}>{item.replies}</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Bookmark size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>No bookmarks yet.</Text>
                        <Text style={styles.emptySubtext}>Save discussions to read them later.</Text>
                    </View>
                )}
            </ScrollView>
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
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 16,
    },
    discussionCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    discussionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    tagBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: colors.glassBackground,
    },
    tagText: {
        color: colors.text,
        fontSize: 11,
        fontWeight: '600',
    },
    bookmarkBtn: {
        padding: 4,
    },
    timeText: {
        color: colors.textSecondary,
        fontSize: 12,
        opacity: 0.9,
    },
    discussionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },
    discussionPreview: {
        fontSize: 14,
        color: colors.text,
        opacity: 0.8,
        marginBottom: 16,
        lineHeight: 20,
    },
    discussionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
    },
    avatarImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    authorName: {
        color: colors.text,
        opacity: 0.8,
        fontSize: 13,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statsText: {
        color: colors.text,
        opacity: 0.8,
        fontSize: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    emptySubtext: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});
