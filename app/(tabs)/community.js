import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Wrench, Zap, Droplets, Hammer, Plus, MessageSquare } from 'lucide-react-native';

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

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
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
                        <TouchableOpacity key={cat.id} style={[styles.categoryCard, { backgroundColor: cat.color + '20' }]}>
                            <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
                                <cat.icon color="#FFF" size={20} />
                            </View>
                            <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Discussions</Text>
                <View style={styles.discussionList}>
                    {DISCUSSIONS.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.discussionCard}>
                            <View style={styles.discussionHeader}>
                                <View style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{item.tag}</Text>
                                </View>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                            <Text style={styles.discussionTitle}>{item.title}</Text>
                            <Text style={styles.discussionPreview}>{item.preview}</Text>

                            <View style={styles.discussionFooter}>
                                <View style={styles.authorRow}>
                                    <View style={styles.avatarPlaceholder} />
                                    <Text style={styles.authorName}>{item.author}</Text>
                                </View>
                                <View style={styles.statsRow}>
                                    <MessageSquare size={14} color={Colors.textSecondary} />
                                    <Text style={styles.statsText}>{item.replies}</Text>
                                </View>
                            </View>
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
    categoryCard: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        width: 100,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
    },
    discussionList: {
        paddingHorizontal: 24,
        gap: 16,
    },
    discussionCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    discussionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tagBadge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: Colors.textSecondary,
        fontSize: 10,
        fontWeight: '600',
    },
    timeText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    discussionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    discussionPreview: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    discussionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primary,
    },
    authorName: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});
