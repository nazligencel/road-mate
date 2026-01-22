import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput, ScrollView, Platform, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Search, Filter, Compass, Navigation, Zap, Wrench, ShoppingCart, Fuel, MessageSquare, ArrowUpRight, Car, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const MAP_MARKERS = [
    { id: 1, type: 'nomad', name: 'Selin', distance: '2.4 km', coordinate: { latitude: 37.0322, longitude: 28.3242 }, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { id: 2, type: 'mechanic', name: 'Jake\'s Garage', distance: '5mi', coordinate: { latitude: 37.0422, longitude: 28.3142 } },
    { id: 3, type: 'market', name: 'Bio Store', distance: '8mi', coordinate: { latitude: 37.0222, longitude: 28.3342 } },
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
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
        coordinate: { latitude: 37.0322, longitude: 28.3242 }
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

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#05080a" }] }, // Deep almost-black for max contrast
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#020617" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] }, // Clean up the map
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] }
];

export default function ExploreScreen() {
    const [selectedNomad, setSelectedNomad] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc);
                }
            } catch (error) {
                console.error("Location Permission Error:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const initialRegion = {
        latitude: location ? location.coords.latitude : 37.0322,
        longitude: location ? location.coords.longitude : 28.3242,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            {/* Real Map View */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Harita Yükleniyor...</Text>
                </View>
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    customMapStyle={mapStyle}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {MAP_MARKERS.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={marker.coordinate}
                            onPress={() => {
                                if (marker.type === 'nomad') {
                                    const nomad = NEARBY_NOMADS.find(n => n.name === marker.name);
                                    if (nomad) setSelectedNomad(nomad);
                                }
                            }}
                        >
                            <View style={styles.customMarker}>
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
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}

            {/* Top Search Bar */}
            <SafeAreaView style={styles.topArea} edges={['top']}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Nomad, mekan ara..."
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.searchInput}
                    />
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/scan')} style={styles.scanBtn}>
                        <Zap size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
                        <Zap size={14} color="#FFF" />
                        <Text style={styles.chipText}>Nomadlar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Wrench size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Tamirciler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <ShoppingCart size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Marketler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Fuel size={14} color={Colors.textSecondary} />
                        <Text style={[styles.chipText, { color: Colors.textSecondary }]}>Yakıt</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Bottom Nomad Slider */}
            <View style={styles.bottomArea}>
                <View style={styles.bottomHeader}>
                    <Text style={styles.bottomTitle}>Yakındakiler</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>Hepsini Gör</Text>
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
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{nomad.vehicle}</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardMeta}>{nomad.distance} • {nomad.vehicleModel}</Text>

                                <TouchableOpacity style={styles.cardNavBtn}>
                                    <Navigation size={14} color="#FFF" fill="#FFF" />
                                    <Text style={styles.navBtnText}>Yol Tarifi</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Nomad Detail Modal */}
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
                                <View style={styles.detailHeader}>
                                    <View style={styles.detailAvatarContainer}>
                                        <Image source={{ uri: selectedNomad.image }} style={styles.detailAvatar} />
                                        <View style={[styles.detailOnlineStatus, { backgroundColor: Colors.online }]} />
                                    </View>
                                    <View style={styles.detailTitleInfo}>
                                        <Text style={styles.detailName}>{selectedNomad.name}</Text>
                                        <Text style={styles.detailSubInfo}>{selectedNomad.status} • {selectedNomad.distance}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.detailChatBtn}>
                                        <MessageSquare size={24} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.infoCardsRow}>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>KARAVAN</Text>
                                        <Text style={styles.infoCardValue}>{selectedNomad.vehicleModel}</Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>ROTA</Text>
                                        <Text style={styles.infoCardValue}>{selectedNomad.route || 'Belirtilmedi'}</Text>
                                    </View>
                                </View>
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
    container: { flex: 1, backgroundColor: Colors.background },
    map: { ...StyleSheet.absoluteFillObject },
    loadingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: Colors.textSecondary, marginTop: 10 },
    customMarker: { alignItems: 'center' },
    markerPointer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 2, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    markerAvatar: { width: 34, height: 34, borderRadius: 17 },
    markerIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    markerLabel: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
    markerText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    topArea: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, zIndex: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card + 'F2', borderRadius: 15, paddingHorizontal: 12, height: 50, marginTop: 10 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#FFF' },
    scanBtn: { padding: 8, marginLeft: 5 },
    filterScroll: { paddingVertical: 12 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
    activeChip: { backgroundColor: Colors.primary },
    chipText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    bottomArea: { position: 'absolute', bottom: Platform.OS === 'ios' ? 90 : 70, left: 0, right: 0 },
    bottomHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
    bottomTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    seeAllText: { color: Colors.primary, fontSize: 14 },
    nomadScroll: { paddingHorizontal: 16, gap: 12 },
    nomadCard: {
        width: width * 0.75,
        backgroundColor: '#1E293B', // Solid dark slate for clear separation
        borderRadius: 24,
        flexDirection: 'row',
        padding: 14,
        gap: 16,
        borderWidth: 1.5,
        borderColor: Colors.primary + '40', // Primary colored border for pop
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 15,
    },
    cardImage: { width: 70, height: 70, borderRadius: 12 },
    cardInfo: { flex: 1, justifyContent: 'center' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    cardName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    statusBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusText: { color: Colors.primary, fontSize: 9, fontWeight: 'bold' },
    cardMeta: { color: Colors.textSecondary, fontSize: 12, marginVertical: 4 },
    cardNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    navBtnText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingBottom: 30 },
    modalHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
    detailContainer: { paddingHorizontal: 20 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    detailAvatarContainer: { position: 'relative' },
    detailAvatar: { width: 60, height: 60, borderRadius: 15 },
    detailOnlineStatus: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.background },
    detailTitleInfo: { flex: 1, marginLeft: 12 },
    detailName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    detailSubInfo: { color: Colors.textSecondary, fontSize: 13 },
    detailChatBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
    infoCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    infoCard: { flex: 1, backgroundColor: Colors.card, padding: 12, borderRadius: 15 },
    infoCardLabel: { color: Colors.textSecondary, fontSize: 10, marginBottom: 4 },
    infoCardValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    mainActionBtn: { backgroundColor: Colors.primary, height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    mainActionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
