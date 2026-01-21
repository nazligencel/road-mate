import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { X, Heart, MessageCircle, MapPin, Coffee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PROFILES = [
    {
        id: 1,
        name: 'Jessica, 28',
        location: 'Currently in Oregon',
        bio: 'Van living for 2 years. Love seeking hot springs and good coffee. Building out a Promaster.',
        interests: ['Hiking', 'Coffee', 'Photography', 'Yoga'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    },
];

export default function DatingScreen() {
    const profile = PROFILES[0];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <Image source={{ uri: profile.image }} style={styles.image} />
                    <LinearGradient
                        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                        style={styles.gradient}
                    >
                        <View style={styles.info}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{profile.name}</Text>
                                <View style={styles.statusDot} />
                            </View>

                            <View style={styles.locationRow}>
                                <MapPin size={16} color={Colors.secondary} />
                                <Text style={styles.location}>{profile.location}</Text>
                            </View>

                            <Text style={styles.bio}>{profile.bio}</Text>

                            <View style={styles.interests}>
                                {profile.interests.map((interest, index) => (
                                    <View key={index} style={styles.interestTag}>
                                        <Text style={styles.interestText}>{interest}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, styles.passBtn]}>
                    <X size={32} color="#EF4444" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.superLikeBtn]}>
                    <Coffee size={24} color="#3B82F6" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]}>
                    <Heart size={32} color="#10B981" fill="#10B981" />
                </TouchableOpacity>
            </View>
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
    filterText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        flex: 1,
        borderRadius: 32,
        backgroundColor: Colors.card,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
    },
    info: {
        gap: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.success,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    location: {
        fontSize: 16,
        color: '#E2E8F0',
    },
    bio: {
        fontSize: 16,
        color: '#CBD5E1',
        lineHeight: 24,
    },
    interests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    interestTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    interestText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    actionBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    likeBtn: {
        width: 72,
        height: 72,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: Colors.success,
    },
    passBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: Colors.error,
    },
    superLikeBtn: {
        width: 50,
        height: 50,
    },
});
