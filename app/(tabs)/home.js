import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Bell, MapPin, Navigation, Flame, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const NEARBY_NOMADS = [
    { id: 1, name: 'Luna', distance: '2mi', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', online: true },
    { id: 2, name: 'River', distance: '5mi', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80', online: false },
    { id: 3, name: 'Sage', distance: '8mi', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80', online: false },
    { id: 4, name: 'Jax', distance: '12mi', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', online: false },
];

const ACTIVITIES = [
    {
        id: 1,
        title: 'Coffee at Joshua Tree',
        time: 'Today, 8:00 AM',
        image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=500&q=80',
        attendees: 3
    },
    {
        id: 2,
        title: 'Surf Session @ San Onofre',
        time: 'Tomorrow, 6:00 AM',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&q=80',
        attendees: 5
    }
];

export default function HomeScreen() {
    // Forced reload check
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' }}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineDot} />
                        </View>
                        <View>
                            <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                            <View style={styles.locationRow}>
                                <Text style={styles.locationTitle}>Sedona, AZ</Text>
                                {/* <ChevronDown size={14} color={Colors.textSecondary} /> */}
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.bellButton}>
                        <Bell size={20} color={Colors.text} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Road Ahead / Map Card */}
                <View style={styles.mapCardContainer}>
                    <View style={styles.mapCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
                            style={styles.mapBackground}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(5, 22, 20, 0.9)']}
                            style={styles.mapOverlay}
                        />

                        <View style={styles.routeBadge}>
                            <View style={styles.pulsingDot} />
                            <Text style={styles.routeText}>On Route</Text>
                        </View>

                        <View style={styles.weatherBadge}>
                            <Text style={styles.weatherText}>☀️ 72°F</Text>
                        </View>

                        <View style={styles.mapContent}>
                            <Text style={styles.sectionLabel}>ROAD AHEAD</Text>
                            <Text style={styles.nextStop}>Next: Grand Canyon South Rim</Text>

                            <View style={styles.mapFooter}>
                                <View>
                                    <Text style={styles.metaLabel}>Remaining</Text>
                                    <Text style={styles.metaValue}>120 miles</Text>
                                </View>
                                <TouchableOpacity style={styles.navButton}>
                                    <Navigation size={18} color="#FFFFFF" fill="#FFFFFF" />
                                    <Text style={styles.navButtonText}>Navigation</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Nearby Nomads */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Nearby Nomads</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>View Map</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nomadScroll}>
                        {NEARBY_NOMADS.map((nomad) => (
                            <TouchableOpacity key={nomad.id} style={styles.nomadItem}>
                                <View style={styles.nomadImageContainer}>
                                    <Image source={{ uri: nomad.image }} style={styles.nomadImage} />
                                    {nomad.online && (
                                        <View style={styles.nomadOnlineBadge}>
                                            <View style={styles.lightningIcon}><Text style={{ fontSize: 8 }}>⚡</Text></View>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.nomadName}>{nomad.name} • {nomad.distance}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Campfire Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Flame size={20} color={Colors.secondary} fill={Colors.secondary} />
                            <Text style={styles.sectionTitle}>Campfire Feed</Text>
                        </View>
                    </View>
                    <Text style={styles.sectionSubtitle}>Local activities happening now</Text>

                    <View style={styles.feedList}>
                        {ACTIVITIES.map((item) => (
                            <View key={item.id} style={styles.activityCard}>
                                <Image source={{ uri: item.image }} style={styles.activityImage} />
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>{item.title}</Text>
                                    <View style={styles.activityMeta}>
                                        <Text style={styles.activityTime}>{item.time}</Text>
                                    </View>
                                    <View style={styles.activityFooter}>
                                        <View style={styles.attendees}>
                                            <View style={[styles.attendeeDot, { backgroundColor: '#FCA5A5' }]} />
                                            <View style={[styles.attendeeDot, { backgroundColor: '#FDE047', marginLeft: -8 }]} />
                                            <View style={[styles.attendeeDot, { backgroundColor: '#86EFAC', marginLeft: -8, justifyContent: 'center', alignItems: 'center' }]}>
                                                <Text style={{ fontSize: 8, color: '#000' }}>+{item.attendees}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.joinButton}>
                                            <Text style={styles.joinText}>Join</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.background,
    },
    locationLabel: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    // Map Card
    mapCardContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    mapCard: {
        height: 220,
        borderRadius: 24,
        backgroundColor: Colors.card,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    routeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(5, 22, 20, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },
    routeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    weatherBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(5, 22, 20, 0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    weatherText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    mapContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    sectionLabel: {
        color: Colors.primary,
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 1,
    },
    nextStop: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    mapFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    metaLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    metaValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    navButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    navButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    // Nomads
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: Colors.text,
        fontSize: 20,
        fontWeight: '700',
    },
    seeAll: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    nomadScroll: {
        paddingHorizontal: 20,
        gap: 20,
    },
    nomadItem: {
        alignItems: 'center',
        gap: 8,
    },
    nomadImageContainer: {
        position: 'relative',
        padding: 3,
        borderWidth: 2,
        borderColor: Colors.secondary,
        borderRadius: 40,
    },
    nomadImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    nomadOnlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.online,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    nomadName: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    // Feed
    sectionSubtitle: {
        paddingHorizontal: 20,
        color: Colors.textSecondary,
        fontSize: 14,
        marginTop: -12,
        marginBottom: 16,
    },
    feedList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        alignItems: 'center',
        gap: 16,
    },
    activityImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    activityTime: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    activityFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    attendees: {
        flexDirection: 'row',
    },
    attendeeDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.card,
    },
    joinButton: {
        backgroundColor: 'rgba(224, 122, 95, 0.15)', // Light Terracotta tint
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
    },
    joinText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
});
