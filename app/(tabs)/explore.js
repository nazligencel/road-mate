import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput, ScrollView, Platform, Modal } from 'react-native';
import { Colors } from '../../constants/Colors';
import { MapPin, Search, Filter, Compass, Navigation, Zap, Wrench, ShoppingCart, Fuel, MessageSquare, ArrowUpRight, Car, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const MAP_MARKERS = [
    { id: 1, type: 'nomad', name: 'Selin', distance: '2.4 km', top: '35%', left: '45%', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { id: 2, type: 'mechanic', name: 'Jake\'s Garage', distance: '5mi', top: '55%', left: '20%' },
    { id: 3, type: 'market', name: 'Bio Store', distance: '8mi', top: '45%', left: '70%' },
];

const NEARBY_NOMADS = [
    {
        id: 1,
        name: 'Selin',
        distance: '2.4 km',
        status: 'Şu an çevrimiçi',
        vehicle: '4x4 Off-road',
        vehicleModel: 'VW Transporter T4',
        route: 'Kuzey (Akyaka)',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80'
    },
    {
        id: 2,
        name: 'Jax',
        distance: '5.1 km',
        status: 'Çevrimdışı',
        vehicle: 'Ford Transit',
        vehicleModel: 'Ford Transit Custom',
        route: 'Güney (Kaş)',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80'
    },
    {
        id: 3,
        name: 'Sage',
        distance: '8.2 km',
        status: 'Şu an çevrimiçi',
        vehicle: 'Vanagon',
        vehicleModel: 'VW Westfalia',
        route: 'Batı (Urla)',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80'
    },
];

export default function ExploreScreen() {
    const [selectedNomad, setSelectedNomad] = useState(null);

    return (
        <View style={styles.container}>
            {/* Fake Map Background */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80' }} // Standard Full Map
                style={styles.mapBackground}
                resizeMode="cover"
            />
            <View style={[styles.mapDimmer, { backgroundColor: Colors.background + '66' }]} />

            {/* Top Search Bar */}
            <SafeAreaView style={styles.topArea} edges={['top']}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search nomads, mechanics..."
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.searchInput}
                    />
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
                        <Zap size={14} color="#FFF" />
                        <Text style={styles.chipText}>Nomads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Wrench size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Mechanics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <ShoppingCart size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Markets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Fuel size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Petrol</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Fake Markers */}
            {MAP_MARKERS.map((marker) => (
                <TouchableOpacity
                    key={marker.id}
                    style={[styles.markerContainer, { top: marker.top, left: marker.left }]}
                    onPress={() => {
                        if (marker.type === 'nomad') {
                            const nomad = NEARBY_NOMADS.find(n => n.name === marker.name);
                            if (nomad) setSelectedNomad(nomad);
                        }
                    }}
                >
                    <View style={styles.markerPointer}>
                        {marker.type === 'nomad' ? (
                            <Image source={{ uri: marker.image }} style={styles.markerAvatar} />
                        ) : (
                            <View style={[styles.markerIcon, { backgroundColor: marker.type === 'mechanic' ? Colors.primary : Colors.secondary }]}>
                                {marker.type === 'mechanic' ? <Wrench size={10} color="#FFF" /> : <ShoppingCart size={10} color="#FFF" />}
                            </View>
                        )}
                    </View>
                    <View style={styles.markerLabel}>
                        <Text style={styles.markerText}>{marker.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {/* Bottom Nomad Slider */}
            <View style={styles.bottomArea}>
                <View style={styles.bottomHeader}>
                    <Text style={styles.bottomTitle}>Nearby in Sedona</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See List</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.nomadScroll}
                    snapToInterval={width * 0.8 + 16}
                    decelerationRate="fast"
                >
                    {NEARBY_NOMADS.map((nomad) => (
                        <TouchableOpacity
                            key={nomad.id}
                            style={styles.nomadCard}
                            onPress={() => setSelectedNomad(nomad)}
                        >
                            <Image source={{ uri: nomad.image }} style={styles.cardImage} />
                            <View style={styles.cardInfo}>
                                <View style={styles.cardTop}>
                                    <Text style={styles.cardName}>{nomad.name}</Text>
                                    <div style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{nomad.vehicle}</Text>
                                    </div>
                                </View>
                                <Text style={styles.cardMeta}>{nomad.distance} away • {nomad.vehicleModel}</Text>

                                <TouchableOpacity style={styles.cardNavBtn}>
                                    <Navigation size={14} color="#FFF" fill="#FFF" />
                                    <Text style={styles.navBtnText}>Directions</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Nomad Detail Bottom Sheet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={selectedNomad !== null}
                onRequestClose={() => setSelectedNomad(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedNomad(null)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />

                        {selectedNomad && (
                            <View style={styles.detailContainer}>
                                {/* Profile Header */}
                                <View style={styles.detailHeader}>
                                    <View style={styles.detailAvatarContainer}>
                                        <Image source={{ uri: selectedNomad.image }} style={styles.detailAvatar} />
                                        <View style={[styles.detailOnlineStatus, { backgroundColor: Colors.online }]} />
                                    </View>

                                    <View style={styles.detailTitleInfo}>
                                        <View style={styles.detailNameRow}>
                                            <Text style={styles.detailName}>{selectedNomad.name}</Text>
                                            <View style={[styles.onlineIndicator, { backgroundColor: Colors.online }]} />
                                            <Text style={styles.onlineText}>{selectedNomad.status}</Text>
                                        </View>
                                        <Text style={styles.detailSubInfo}>
                                            {selectedNomad.distance} mesafede • {selectedNomad.vehicle}
                                        </Text>
                                    </View>

                                    <TouchableOpacity style={styles.detailChatBtn}>
                                        <MessageSquare size={24} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Info Cards */}
                                <View style={styles.infoCardsRow}>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>KARAVAN TİPİ</Text>
                                        <View style={styles.infoCardValueRow}>
                                            <Car size={16} color={Colors.primary} />
                                            <Text style={styles.infoCardValue}>{selectedNomad.vehicleModel}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>ROTA YÖNÜ</Text>
                                        <View style={styles.infoCardValueRow}>
                                            <ArrowUpRight size={16} color={Colors.accent} />
                                            <Text style={styles.infoCardValue}>{selectedNomad.route}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Main Action Button */}
                                <TouchableOpacity style={styles.mainActionBtn}>
                                    <Car size={24} color="#0C1210" />
                                    <Text style={styles.mainActionBtnText}>Buluşma Noktası Oluştur</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: Colors.background,
    },
    mapBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    mapDimmer: {
        ...StyleSheet.absoluteFillObject,
    },
    topArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card + 'E6',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginTop: 10,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    filterBtn: {
        padding: 8,
    },
    filterScroll: {
        paddingVertical: 16,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.card + 'CC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    bottomArea: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 80,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    bottomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    bottomTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    nomadScroll: {
        paddingHorizontal: 20,
        gap: 16,
    },
    nomadCard: {
        width: width * 0.8,
        backgroundColor: Colors.card,
        borderRadius: 24,
        flexDirection: 'row',
        padding: 12,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusBadge: {
        backgroundColor: Colors.primary + '33',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: '700',
    },
    cardMeta: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 10,
    },
    cardNavBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    navBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    // Marker Styles
    markerContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    markerPointer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    markerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    markerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerLabel: {
        backgroundColor: 'rgba(28, 25, 23, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    markerText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    // Detail Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(5, 10, 15, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    detailContainer: {
        paddingHorizontal: 24,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    detailAvatarContainer: {
        position: 'relative',
    },
    detailAvatar: {
        width: 72,
        height: 72,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    detailOnlineStatus: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: Colors.card,
    },
    detailTitleInfo: {
        flex: 1,
        marginLeft: 16,
    },
    detailNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    detailName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    onlineText: {
        color: Colors.online,
        fontSize: 12,
        fontWeight: '600',
    },
    detailSubInfo: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    detailChatBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoCardLabel: {
        color: Colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    infoCardValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoCardValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    mainActionBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    mainActionBtnText: {
        color: '#0C1210',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
