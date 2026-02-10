import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput, Alert } from 'react-native';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Wrench, Zap, Droplets, Hammer, Plus, MessageSquare, Search, Bookmark, AlertTriangle, Crown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState, useEffect } from 'react';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { SOSService, BASE_URL } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const CATEGORIES = [
    { id: 1, name: 'Electrical', icon: Zap, color: '#F59E0B' },
    { id: 2, name: 'Carpentry', icon: Hammer, color: '#8B5CF6' },
    { id: 3, name: 'Plumbing', icon: Droplets, color: '#3B82F6' },
    { id: 4, name: 'Mechanical', icon: Wrench, color: '#EF4444' },
];

const GlassCard = ({ children, style, intensity = 20, tint = 'dark', contentContainerStyle }) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
        <View style={[{ padding: 16 }, contentContainerStyle]}>
            {children}
        </View>
    </View>
);

export default function CommunityScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { discussions, savedIds, toggleSave, fetchDiscussions } = useDiscussions();
    const { isPro } = useSubscription();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sosActive, setSosActive] = useState(false);
    const [sosLoading, setSosLoading] = useState(false);

    const handleSOS = async () => {
        if (!isPro) { router.push('/paywall'); return; }
        setSosLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (sosActive) {
                const result = await SOSService.deactivate(token);
                if (result.success) setSosActive(false);
                setSosLoading(false);
            } else {
                Alert.alert('Activate SOS', 'This will alert nearby users that you need roadside help. Continue?', [
                    { text: 'Cancel', style: 'cancel', onPress: () => setSosLoading(false) },
                    { text: 'Activate SOS', style: 'destructive', onPress: async () => {
                        const result = await SOSService.activate(token);
                        if (result.success) setSosActive(true);
                        setSosLoading(false);
                    }}
                ]);
                return;
            }
        } catch (error) {
            console.error('SOS error:', error);
            setSosLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const filteredDiscussions = useMemo(() => {
        return discussions.filter(item => {
            // Filter by Category
            if (selectedCategory) {
                const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name;
                if (item.tag !== categoryName) return false;
            }

            // Filter by Search Query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return item.title.toLowerCase().includes(query) ||
                    item.preview.toLowerCase().includes(query);
            }

            return true;
        });
    }, [discussions, selectedCategory, searchQuery]);

    return (
        <View style={styles.container}>
            {/* Top Gradient Glow matching Profile */}
            <View style={{ position: 'absolute', top: 0, width: '100%', height: 300 }}>
                <LinearGradient
                    colors={[colors.primary, colors.background]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    opacity={0.8}
                />
            </View>
            {/* Main Background */}
            <View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: colors.background }]} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Builder Hub</Text>
                <TouchableOpacity style={styles.createBtnContainer} onPress={() => router.push('/create-discussion')}>
                    <LinearGradient
                        colors={[colors.primary, colors.online]}
                        style={styles.createBtnGradient}
                    >
                        <View style={styles.createBtnInner}>
                            <Plus color="#FFF" size={20} strokeWidth={3} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search topics..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* SOS Banner */}
                <TouchableOpacity
                    style={[styles.sosBanner, sosActive && styles.sosBannerActive]}
                    onPress={handleSOS}
                    disabled={sosLoading}
                    activeOpacity={0.7}
                >
                    <View style={[styles.sosIcon, { backgroundColor: sosActive ? '#EF4444' : '#EF444420' }]}>
                        <AlertTriangle size={18} color={sosActive ? '#FFF' : '#EF4444'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.sosTitle, sosActive && { color: '#EF4444' }]}>
                            {sosActive ? 'SOS Active' : 'Emergency SOS'}
                        </Text>
                        <Text style={styles.sosSub}>
                            {sosActive ? 'Tap to deactivate' : 'Alert nearby travelers'}
                        </Text>
                    </View>
                    {!isPro && (
                        <View style={styles.proBadge}>
                            <Crown size={10} color="#C5A059" />
                            <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Browse Topics</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(isSelected ? null : cat.id)}>
                                <GlassCard
                                    style={[
                                        styles.categoryCard,
                                        isSelected && { borderColor: '#22d3ee', borderWidth: 2 } // Cyan border for selected
                                    ]}
                                    intensity={20}
                                    tint={isDarkMode ? 'dark' : 'light'}
                                    contentContainerStyle={{ padding: 0, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
                                >
                                    <View style={[
                                        styles.iconBox,
                                        { backgroundColor: cat.color + '15' } // Lighter background for better visibility
                                    ]}>
                                        <cat.icon color={cat.color} size={18} />
                                    </View>
                                    <Text style={[
                                        styles.categoryName,
                                        isSelected && { color: '#22d3ee', fontWeight: '700' }
                                    ]}>{cat.name}</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Discussions</Text>
                <View style={styles.discussionList}>
                    {filteredDiscussions.length > 0 ? (
                        filteredDiscussions.map((item) => (
                            <TouchableOpacity key={item.id} onPress={() => router.push(`/discussion/${item.id}`)}>
                                <GlassCard style={styles.discussionCard} tint={isDarkMode ? 'dark' : 'light'}>
                                    <View style={styles.discussionHeader}>
                                        <View style={styles.tagBadge}>
                                            <Text style={styles.tagText}>{item.tag}</Text>
                                        </View>

                                        {/* Bookmark Icon - Absolute Positioned */}
                                        <TouchableOpacity style={styles.bookmarkBtn} onPress={() => toggleSave(item.id)}>
                                            <Bookmark
                                                size={20}
                                                color={savedIds.includes(item.id) ? colors.primary : colors.textSecondary}
                                                fill={savedIds.includes(item.id) ? colors.primary : 'none'}
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
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
                            No discussions found matching your criteria.
                        </Text>
                    )}
                </View>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    createBtnContainer: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    createBtnGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2, // Acts as border width
        justifyContent: 'center',
        alignItems: 'center',
    },
    createBtnInner: {
        flex: 1,
        width: '100%',
        borderRadius: 20, // Inner radius matches outer roughly
        backgroundColor: '#1e293b', // Dark background to match theme
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    sosBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    sosBannerActive: {
        borderColor: '#EF4444',
        borderWidth: 2,
        backgroundColor: '#EF444410',
    },
    sosIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    sosSub: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 1,
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#C5A05915',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    proBadgeText: {
        color: '#C5A059',
        fontSize: 10,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassBackground,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 20,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: colors.text,
        fontSize: 15,
        height: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 16,
        marginBottom: 16,
    },
    categoriesScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    categoryCard: {
        width: 80,
        height: 80, // Circular aspect ratio
        borderRadius: 40, // Fully round
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        color: colors.text,
        marginTop: 4,
    },
    discussionList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    bookmarkBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
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
    timeText: {
        color: colors.textSecondary === '#64748b' ? '#94a3b8' : colors.textSecondary, // Use original or slightly adjusted if valid
        opacity: 0.9, // Make it more visible
        fontSize: 12,
    },
    discussionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },
    discussionPreview: {
        fontSize: 14,
        color: colors.text, // Changed from textSecondary to text for better contrast
        opacity: 0.8, // Slightly reduced opacity to distinguish from title, but much readable than grey
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
        color: colors.text, // Improved contrast
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
        color: colors.text, // Improved contrast
        opacity: 0.8,
        fontSize: 12,
    },
});
