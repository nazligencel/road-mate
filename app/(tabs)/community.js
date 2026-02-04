import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Wrench, Zap, Droplets, Hammer, Plus, MessageSquare } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
    { id: 1, name: 'Electrical', icon: Zap, color: '#F59E0B' },
    { id: 2, name: 'Carpentry', icon: Hammer, color: '#8B5CF6' },
    { id: 3, name: 'Plumbing', icon: Droplets, color: '#3B82F6' },
    { id: 4, name: 'Mechanical', icon: Wrench, color: '#EF4444' },
];

const DISCUSSIONS = [
    {
        id: 1,
        title: 'Help with Solar Setup?',
        author: 'NewbieVan',
        replies: 24,
        tag: 'Electrical',
        preview: 'I have 200W panels but my battery keeps draining...',
        time: '2h ago'
    },
    {
        id: 2,
        title: 'Best insulation for cold climates?',
        author: 'SnowSeeker',
        replies: 12,
        tag: 'General',
        preview: 'Looking at Havelock wool vs Spray foam. Thoughts?',
        time: '5h ago'
    },
];

const GlassCard = ({ children, style, intensity = 20 }) => (
    <View style={[styles.glassCardContainer, style]}>
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.glassCardContent}>
            {children}
        </View>
    </View>
);

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
            {/* Background Gradient for Glass Effect */}
            <LinearGradient
                colors={[Colors.background, '#1e293b', Colors.background]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Builder Hub</Text>
                <TouchableOpacity style={styles.createBtn}>
                    <Plus color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>Browse Topics</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id}>
                            <GlassCard style={styles.categoryCard} intensity={15}>
                                <View style={[styles.iconBox, { backgroundColor: cat.color + '20' }]}>
                                    <cat.icon color={cat.color} size={24} />
                                </View>
                                <Text style={[styles.categoryName, { color: '#FFF' }]}>{cat.name}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Discussions</Text>
                <View style={styles.discussionList}>
                    {DISCUSSIONS.map((item) => (
                        <TouchableOpacity key={item.id}>
                            <GlassCard style={styles.discussionCard}>
                                <View style={styles.discussionHeader}>
                                    <View style={[styles.tagBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Text style={styles.tagText}>{item.tag}</Text>
                                    </View>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                                <Text style={styles.discussionTitle}>{item.title}</Text>
                                <Text style={styles.discussionPreview}>{item.preview}</Text>

                                <View style={styles.discussionFooter}>
                                    <View style={styles.authorRow}>
                                        <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]} />
                                        <Text style={styles.authorName}>{item.author}</Text>
                                    </View>
                                    <View style={styles.statsRow}>
                                        <MessageSquare size={14} color={Colors.textSecondary} />
                                        <Text style={styles.statsText}>{item.replies}</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
    },
    createBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: 24,
        marginBottom: 16,
    },
    categoriesScroll: {
        paddingHorizontal: 24,
        gap: 12,
    },
    glassCardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.05)',
        }),
    },
    glassCardContent: {
        padding: 16,
    },
    categoryCard: {
        width: 100,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    discussionList: {
        paddingHorizontal: 24,
        gap: 16,
    },
    discussionCard: {
        // Layout handled by glassCardContainer
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
    },
    tagText: {
        color: Colors.text,
        fontSize: 11,
        fontWeight: '600',
    },
    timeText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    discussionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 6,
    },
    discussionPreview: {
        fontSize: 14,
        color: Colors.textSecondary,
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
    },
    authorName: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statsText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});
