import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput, ScrollView, Platform, Modal, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Search, Filter, Compass, Navigation, Zap, Wrench, ShoppingCart, Fuel, MessageSquare, ArrowUpRight, Car, X, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NomadService } from '../../services/api';

const { width, height } = Dimensions.get('window');



const MECHANICS = [
    { id: 101, name: "Jake's Garage", type: 'mechanic', distance: '3.2 km', coordinate: { latitude: 37.0422, longitude: 28.3142 }, image: 'https://images.unsplash.com/photo-1487754180477-db33d3d63b0a?w=100&q=80', status: 'Open', vehicle: 'Repair', vehicle_model: 'All Types' },
    { id: 102, name: "AutoFix Center", type: 'mechanic', distance: '5.5 km', coordinate: { latitude: 37.0122, longitude: 28.3442 }, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&q=80', status: 'Closed', vehicle: 'Service', vehicle_model: 'Engine Specialist' },
];

const MARKETS = [
    { id: 201, name: "Bio Store", type: 'market', distance: '1.8 km', coordinate: { latitude: 37.0222, longitude: 28.3342 }, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80', status: 'Open 24/7', vehicle: 'Groceries', vehicle_model: 'Organic' },
    { id: 202, name: "City Supermarket", type: 'market', distance: '4.0 km', coordinate: { latitude: 37.0522, longitude: 28.3042 }, image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=100&q=80', status: 'Open', vehicle: 'Supplies', vehicle_model: 'General' },
];

const FUEL_STATIONS = [
    { id: 301, name: "Shell Station", type: 'fuel', distance: '2.5 km', coordinate: { latitude: 37.0352, longitude: 28.3152 }, image: 'https://images.unsplash.com/photo-1545459720-aac3e5c2fa0c?w=100&q=80', status: 'Open 24/7', vehicle: 'Fuel', vehicle_model: 'Diesel/Petrol' },
    { id: 302, name: "BP Express", type: 'fuel', distance: '6.2 km', coordinate: { latitude: 37.0152, longitude: 28.3552 }, image: 'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?w=100&q=80', status: 'Open', vehicle: 'Fuel', vehicle_model: 'EV Charging' },
];

const NEARBY_NOMADS = [
    {
        id: 1,
        name: 'Selin',
        distance: '2.4 km',
        status: 'Active',
        vehicle: '4x4 Off-road',
        vehicleModel: 'VW Transporter T4',
        route: 'North (Akyaka)',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
        coordinate: { latitude: 37.0322, longitude: 28.3242 },
        type: 'nomad'
    },
    {
        id: 2,
        name: 'Jax',
        distance: '5.1 km',
        status: 'Offline',
        vehicle: 'Ford Transit',
        vehicleModel: 'Ford Transit Custom',
        route: 'South (Kaş)',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
        coordinate: { latitude: 37.0422, longitude: 28.3142 },
        type: 'nomad'
    },
    {
        id: 3,
        name: 'Sage',
        distance: '8.2 km',
        status: 'Active',
        vehicle: 'Vanagon',
        vehicleModel: 'VW Westfalia',
        route: 'West (Urla)',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
        coordinate: { latitude: 37.0222, longitude: 28.3342 },
        type: 'nomad'
    },
];

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8ec3b9"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1a3646"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4b6878"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#64779e"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4b6878"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#334e87"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6f9ba5"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3C7680"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#304a7d"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c6675"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#255763"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#b0d5ce"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3a4762"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0e1626"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#4e6d70"
            }
        ]
    }
];

export default function ExploreScreen() {
    const [selectedNomad, setSelectedNomad] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nearbyNomads, setNearbyNomads] = useState(NEARBY_NOMADS); // This acts as the "Active List"
    const [isFetching, setIsFetching] = useState(false);
    const [activeCategory, setActiveCategory] = useState('nomads'); // nomads, mechanics, markets, fuel

    useEffect(() => {
        let locationSubscription = null;

        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    locationSubscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Balanced,
                            timeInterval: 10000,
                            distanceInterval: 100,
                        },
                        async (newLocation) => {
                            setLocation(newLocation);
                            setLoading(false);

                            if (!isFetching) {
                                setIsFetching(true);
                                try {
                                    // Fetch nomads if category is nomads
                                    if (activeCategory === 'nomads') {
                                        const nomads = await NomadService.getNearbyNomads(
                                            newLocation.coords.latitude,
                                            newLocation.coords.longitude
                                        );
                                        if (nomads && Array.isArray(nomads) && nomads.length > 0) {
                                            setNearbyNomads(nomads);
                                        } else {
                                            setNearbyNomads(NEARBY_NOMADS);
                                        }
                                    }
                                } catch (e) {
                                    console.log("API not reached, using dummy data");
                                    setNearbyNomads(NEARBY_NOMADS);
                                } finally {
                                    setIsFetching(false);
                                }
                            }
                        }
                    );
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Location Permission Error:", error);
                setLoading(false);
            }
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    const handleGetDirections = (lat, lng, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        // Switch data source based on category
        switch (category) {
            case 'nomads':
                setNearbyNomads(NEARBY_NOMADS);
                break;
            case 'mechanics':
                setNearbyNomads(MECHANICS);
                break;
            case 'markets':
                setNearbyNomads(MARKETS);
                break;
            case 'fuel':
                setNearbyNomads(FUEL_STATIONS);
                break;
            default:
                setNearbyNomads(NEARBY_NOMADS);
        }
    };

    const initialRegion = {
        latitude: location?.coords?.latitude || 37.0322,
        longitude: location?.coords?.longitude || 28.3242,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading Map...</Text>
                </View>
            ) : (
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={initialRegion}
                    customMapStyle={mapStyle}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                >


                    {nearbyNomads.map((marker) => {
                        const coord = marker.coordinate || { latitude: marker.latitude, longitude: marker.longitude };
                        if (!coord.latitude || !coord.longitude) return null;

                        let MarkerIcon = null;
                        let iconBg = Colors.primary;

                        if (activeCategory === 'nomads') {
                            // Use image for nomads
                        } else if (activeCategory === 'mechanics') {
                            MarkerIcon = <Wrench size={16} color="#FFF" />;
                            iconBg = '#ef4444'; // Red for mech
                        } else if (activeCategory === 'markets') {
                            MarkerIcon = <ShoppingCart size={16} color="#FFF" />;
                            iconBg = '#22c55e'; // Green for market
                        } else if (activeCategory === 'fuel') {
                            MarkerIcon = <Fuel size={16} color="#FFF" />;
                            iconBg = '#f59e0b'; // Orange for fuel
                        }

                        return (
                            <Marker
                                key={`${activeCategory}-${marker.id}`}
                                coordinate={coord}
                                onPress={() => setSelectedNomad(marker)}
                            >
                                <View style={styles.customMarker}>
                                    <View style={[
                                        styles.markerPointer,
                                        { backgroundColor: activeCategory === 'nomads' ? '#FFF' : iconBg, borderColor: activeCategory === 'nomads' ? Colors.primary : '#FFF' }
                                    ]}>
                                        {activeCategory === 'nomads' ? (
                                            <Image source={{ uri: marker.image || 'https://via.placeholder.com/100' }} style={styles.markerAvatar} />
                                        ) : (
                                            MarkerIcon
                                        )}
                                    </View>
                                    <View style={styles.markerLabel}>
                                        <Text style={styles.markerText}>{marker.name}</Text>
                                    </View>
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>
            )}

            <SafeAreaView style={styles.topArea} edges={['top']}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search nomads, places..."
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'nomads' && styles.activeChip]}
                        onPress={() => handleCategoryChange('nomads')}
                    >
                        <Zap size={14} color={activeCategory === 'nomads' ? '#FFF' : Colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'nomads' && { color: Colors.textSecondary }]}>Nomads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'mechanics' && styles.activeChip]}
                        onPress={() => handleCategoryChange('mechanics')}
                    >
                        <Wrench size={14} color={activeCategory === 'mechanics' ? '#FFF' : Colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'mechanics' && { color: Colors.textSecondary }]}>Mechanics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'markets' && styles.activeChip]}
                        onPress={() => handleCategoryChange('markets')}
                    >
                        <ShoppingCart size={14} color={activeCategory === 'markets' ? '#FFF' : Colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'markets' && { color: Colors.textSecondary }]}>Markets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'fuel' && styles.activeChip]}
                        onPress={() => handleCategoryChange('fuel')}
                    >
                        <Fuel size={14} color={activeCategory === 'fuel' ? '#FFF' : Colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'fuel' && { color: Colors.textSecondary }]}>Fuel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <View style={styles.bottomArea}>
                <View style={styles.bottomHeader}>
                    <Text style={styles.bottomTitle}>Nearby</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.nomadScroll}
                    snapToInterval={width * 0.8 + 16}
                    decelerationRate="fast"
                >
                    {nearbyNomads.map((nomad) => {
                        const nomadLat = nomad.coordinate?.latitude || nomad.latitude;
                        const nomadLng = nomad.coordinate?.longitude || nomad.longitude;

                        return (
                            <TouchableOpacity
                                key={nomad.id}
                                style={styles.nomadCard}
                                onPress={() => setSelectedNomad(nomad)}
                            >
                                <Image source={{ uri: nomad.image }} style={styles.nomadCardImage || styles.cardImage} />
                                <View style={styles.cardInfo}>
                                    <View style={styles.cardTop}>
                                        <Text style={styles.cardName}>{nomad.name}</Text>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>{nomad.vehicle}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardMeta}>
                                        {typeof nomad.distance === 'number' ? nomad.distance.toFixed(1) + 'km' : (nomad.distance || '?.? km')} • {nomad.vehicle_model || nomad.vehicleModel}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.cardNavBtn}
                                        onPress={() => handleGetDirections(nomadLat, nomadLng, nomad.name)}
                                    >
                                        <Navigation size={14} color={Colors.primary} fill={Colors.primary} />
                                        <Text style={styles.navBtnText}>Get Directions</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

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
                                        <Image
                                            source={{ uri: selectedNomad.image || 'https://via.placeholder.com/150' }}
                                            style={styles.detailAvatar}
                                        />
                                        <View style={[styles.detailOnlineStatus, { backgroundColor: Colors.online }]} />
                                    </View>
                                    <View style={styles.detailTitleInfo}>
                                        <Text style={styles.detailName}>{selectedNomad.name || 'Nomad'}</Text>
                                        <Text style={styles.detailSubInfo}>
                                            {selectedNomad.status || 'Active'} • {
                                                typeof selectedNomad.distance === 'number'
                                                    ? selectedNomad.distance.toFixed(1) + ' km'
                                                    : (selectedNomad.distance || '?.? km')
                                            }
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.detailChatBtn}>
                                        <MessageSquare size={24} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.infoCardsRow}>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>VEHICLE</Text>
                                        <Text style={styles.infoCardValue}>
                                            {selectedNomad.vehicle_model || selectedNomad.vehicleModel || 'Caravan'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoCardLabel}>ROUTE</Text>
                                        <Text style={styles.infoCardValue}>{selectedNomad.route || 'Not specified'}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.mainActionBtn}
                                    onPress={() => {
                                        console.log("Create Meeting Point clicked");
                                        // Placeholder for future logic
                                        alert(`Creating meeting point with ${selectedNomad.name}...`);
                                    }}
                                >
                                    <MapPin size={24} color="#0C1210" />
                                    <Text style={styles.mainActionBtnText}>Create Meeting Point</Text>
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
        backgroundColor: '#1E293B',
        borderRadius: 24,
        flexDirection: 'row',
        padding: 14,
        gap: 16,
        borderWidth: 1.5,
        borderColor: Colors.primary + '40',
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHandle: { width: 45, height: 5, backgroundColor: '#334155', borderRadius: 2.5, alignSelf: 'center', marginVertical: 15 },
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
