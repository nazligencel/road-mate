import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput, ScrollView, Platform, Modal, ActivityIndicator, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Filter, Compass, Navigation, Zap, Wrench, ShoppingCart, ShoppingBag, ShoppingBasket, Fuel, MessageSquare, ArrowUpRight, Car, X, MapPin, AlertTriangle, Crown, Route } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NomadService, PlacesService, NotificationService, SOSService } from '../../services/api';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSettings } from '../../contexts/SettingsContext';

const { width, height } = Dimensions.get('window');

// Helper function to generate places near the user's location
const generateNearbyPlaces = (userLat, userLng) => {
    const mechanics = [
        { id: 101, name: "Jake's Garage", type: 'mechanic', distance: 3.2, coordinate: { latitude: userLat + 0.01, longitude: userLng + 0.008 }, image: 'https://images.unsplash.com/photo-1487754180477-db33d3d63b0a?w=100&q=80', status: 'Open', vehicle: 'Repair', vehicle_model: 'All Types' },
        { id: 102, name: "AutoFix Center", type: 'mechanic', distance: 5.5, coordinate: { latitude: userLat - 0.015, longitude: userLng + 0.012 }, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&q=80', status: 'Closed', vehicle: 'Service', vehicle_model: 'Engine Specialist' },
        { id: 103, name: "Pro Mechanics", type: 'mechanic', distance: 2.1, coordinate: { latitude: userLat + 0.005, longitude: userLng - 0.01 }, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&q=80', status: 'Open', vehicle: 'Repair', vehicle_model: 'German Cars' },
    ];

    const markets = [
        { id: 201, name: "Bio Store", type: 'market', distance: 1.8, coordinate: { latitude: userLat - 0.005, longitude: userLng + 0.005 }, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80', status: 'Open 24/7', vehicle: 'Groceries', vehicle_model: 'Organic' },
        { id: 202, name: "City Supermarket", type: 'market', distance: 4.0, coordinate: { latitude: userLat + 0.02, longitude: userLng - 0.015 }, image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=100&q=80', status: 'Open', vehicle: 'Supplies', vehicle_model: 'General' },
        { id: 203, name: "Fresh Market", type: 'market', distance: 0.8, coordinate: { latitude: userLat + 0.002, longitude: userLng + 0.003 }, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=100&q=80', status: 'Open', vehicle: 'Fresh Food', vehicle_model: 'Local' },
    ];

    const fuelStations = [
        { id: 301, name: "Shell Station", type: 'fuel', distance: 2.5, coordinate: { latitude: userLat + 0.008, longitude: userLng + 0.015 }, image: 'https://images.unsplash.com/photo-1545459720-aac3e5c2fa0c?w=100&q=80', status: 'Open 24/7', vehicle: 'Fuel', vehicle_model: 'Diesel/Petrol' },
        { id: 302, name: "BP Express", type: 'fuel', distance: 6.2, coordinate: { latitude: userLat - 0.025, longitude: userLng + 0.02 }, image: 'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?w=100&q=80', status: 'Open', vehicle: 'Fuel', vehicle_model: 'EV Charging' },
        { id: 303, name: "Total Petrol", type: 'fuel', distance: 1.5, coordinate: { latitude: userLat - 0.003, longitude: userLng - 0.008 }, image: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=100&q=80', status: 'Open 24/7', vehicle: 'Fuel', vehicle_model: 'LPG/Diesel' },
    ];

    const nomads = [
        { id: 1, name: 'Selin', distance: 2.4, status: 'Active', vehicle: '4x4 Off-road', vehicleModel: 'VW Transporter T4', route: 'North', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', coordinate: { latitude: userLat + 0.012, longitude: userLng - 0.008 }, type: 'nomad' },
        { id: 2, name: 'Jax', distance: 5.1, status: 'Offline', vehicle: 'Ford Transit', vehicleModel: 'Ford Transit Custom', route: 'South', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80', coordinate: { latitude: userLat - 0.018, longitude: userLng + 0.015 }, type: 'nomad' },
        { id: 3, name: 'Sage', distance: 8.2, status: 'Active', vehicle: 'Vanagon', vehicleModel: 'VW Westfalia', route: 'West', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80', coordinate: { latitude: userLat + 0.025, longitude: userLng + 0.02 }, type: 'nomad' },
        { id: 4, name: 'Luna', distance: 1.2, status: 'Active', vehicle: 'Sprinter', vehicleModel: 'Mercedes Sprinter', route: 'East', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80', coordinate: { latitude: userLat - 0.004, longitude: userLng - 0.006 }, type: 'nomad' },
    ];

    return { mechanics, markets, fuelStations, nomads };
};

// Default location fallback
const DEFAULT_LAT = 41.0082;
const DEFAULT_LNG = 28.9784;

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }] },
    { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
    { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
    { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
    { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#023e58" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#3C7680" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
    { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ce" }] },
    { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#023e58" }] },
    { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
    { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
    { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#283d6a" }] },
    { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#3a4762" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];

export default function ExploreScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro } = useSubscription();
    const { locationServices } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [selectedNomad, setSelectedNomad] = useState(null);
    const [sosUsers, setSosUsers] = useState([]);
    // Initialize with default location to prevent white screen if location fetch fails/delays
    const [location, setLocation] = useState({
        coords: {
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG
        }
    });
    const [loading, setLoading] = useState(false); // Do not block UI with loading state
    const [nearbyPlaces, setNearbyPlaces] = useState(() => generateNearbyPlaces(DEFAULT_LAT, DEFAULT_LNG));
    const [activeMarkers, setActiveMarkers] = useState([]); // Current markers on map
    const [isFetching, setIsFetching] = useState(false);
    const [activeCategory, setActiveCategory] = useState('nomads'); // nomads, mechanics, markets, fuel
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let locationSubscription = null;
        let initialFetchDone = false;

        if (!locationServices) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const enabled = await Location.hasServicesEnabledAsync();
                if (!enabled) {
                    setLoading(false);
                    console.log("Location services are disabled on the device.");
                    return;
                }

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

                            // Generate mock places as fallback
                            const mockPlaces = generateNearbyPlaces(
                                newLocation.coords.latitude,
                                newLocation.coords.longitude
                            );
                            setNearbyPlaces(mockPlaces);

                            // Fetch real nomads on initial location
                            if (!initialFetchDone && activeCategory === 'nomads') {
                                initialFetchDone = true;
                                try {
                                    const token = await AsyncStorage.getItem('userToken');
                                    const realNomads = await NomadService.getNearbyNomads(
                                        newLocation.coords.latitude,
                                        newLocation.coords.longitude,
                                        token
                                    );
                                    if (realNomads && realNomads.length > 0) {
                                        const nomadsWithType = realNomads.map(n => ({ ...n, type: 'nomad' }));
                                        setActiveMarkers(nomadsWithType);
                                    } else {
                                        setActiveMarkers(mockPlaces.nomads);
                                    }
                                } catch (err) {
                                    console.log("Initial nomad fetch error:", err);
                                    setActiveMarkers(mockPlaces.nomads);
                                }

                                // Fetch SOS users
                                try {
                                    const sos = await SOSService.getNearby(
                                        newLocation.coords.latitude,
                                        newLocation.coords.longitude
                                    );
                                    setSosUsers(sos || []);
                                } catch (err) {
                                    console.log("SOS fetch error:", err);
                                }
                            }
                        }
                    ).catch(err => {
                        console.log("Explore WatchPosition Error:", err.message);
                    });
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Location Permission Error:", error.message);
                setLoading(false);
            }
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [locationServices]);

    // Helper to update markers based on category
    const updateMarkers = (category, places) => {
        switch (category) {
            case 'nomads':
                setActiveMarkers(places.nomads);
                break;
            case 'mechanics':
                setActiveMarkers(places.mechanics);
                break;
            case 'markets':
                setActiveMarkers(places.markets);
                break;
            case 'fuel':
                setActiveMarkers(places.fuelStations);
                break;
            default:
                setActiveMarkers(places.nomads);
        }
    };

    // Initialize markers on mount
    useEffect(() => {
        updateMarkers(activeCategory, nearbyPlaces);
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

    const handleCategoryChange = async (category) => {
        setActiveCategory(category);

        if (!location?.coords) {
            updateMarkers(category, nearbyPlaces);
            return;
        }

        setIsFetching(true);
        try {
            if (category === 'nomads') {
                // Fetch nomads from backend
                const token = await AsyncStorage.getItem('userToken');
                const realNomads = await NomadService.getNearbyNomads(
                    location.coords.latitude,
                    location.coords.longitude,
                    token
                );

                if (realNomads && realNomads.length > 0) {
                    console.log(`✅ Fetched ${realNomads.length} real nomads`);
                    // Add type field for marker rendering
                    const nomadsWithType = realNomads.map(n => ({ ...n, type: 'nomad' }));
                    setActiveMarkers(nomadsWithType);
                } else {
                    console.log(`⚠️ No real nomads found, using mock data`);
                    updateMarkers(category, nearbyPlaces);
                }
            } else {
                // For non-nomad categories, fetch from Google Places API
                const realPlaces = await PlacesService.getNearbyPlaces(
                    location.coords.latitude,
                    location.coords.longitude,
                    category
                );

                if (realPlaces && realPlaces.length > 0) {
                    console.log(`✅ Fetched ${realPlaces.length} real ${category}`);
                    setActiveMarkers(realPlaces);
                } else {
                    console.log(`⚠️ No real ${category} found, using mock data`);
                    updateMarkers(category, nearbyPlaces);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            updateMarkers(category, nearbyPlaces);
        } finally {
            setIsFetching(false);
        }
    };

    const displayMarkers = useMemo(() => {
        if (!searchQuery.trim()) return activeMarkers;
        const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        return activeMarkers.filter(item => {
            const searchable = [
                item.name,
                item.vehicle,
                item.vehicleModel,
                item.vehicle_model,
                item.status,
                item.route,
                item.address,
            ].filter(Boolean).join(' ').toLowerCase();
            return words.every(word => searchable.includes(word));
        });
    }, [activeMarkers, searchQuery]);

    const initialRegion = {
        latitude: location?.coords?.latitude || DEFAULT_LAT,
        longitude: location?.coords?.longitude || DEFAULT_LNG,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Map...</Text>
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


                    {/* SOS Active Users - Red pulsing markers */}
                    {sosUsers.map((sos) => (
                        <Marker
                            key={`sos-${sos.id}`}
                            coordinate={{ latitude: sos.latitude, longitude: sos.longitude }}
                            onPress={() => setSelectedNomad({ ...sos, isSOS: true, type: 'nomad' })}
                            tracksViewChanges={false}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={{
                                width: 42, height: 42, borderRadius: 21,
                                backgroundColor: '#EF4444', borderWidth: 3, borderColor: '#FCA5A5',
                                justifyContent: 'center', alignItems: 'center',
                                elevation: 8, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6, shadowRadius: 10,
                            }}>
                                <AlertTriangle size={20} color="#FFF" />
                            </View>
                        </Marker>
                    ))}

                    {displayMarkers.map((marker) => {
                        const coord = marker.coordinate || { latitude: marker.latitude, longitude: marker.longitude };
                        if (!coord.latitude || !coord.longitude) return null;

                        // Identify item type for icon selection (handle both singular/plural and variations)
                        const categoryLower = activeCategory.toLowerCase();
                        const markerTypeLower = (marker.type || '').toLowerCase();
                        let MarkerComponent = null;
                        let iconBgColor = colors.primary;

                        // Check for mechanics
                        if (markerTypeLower.includes('mechanic') || categoryLower.includes('mechanic')) {
                            MarkerComponent = <Wrench size={20} color="#FFF" fill="#FFF" />;
                            iconBgColor = '#e11d48'; // Variant 3 Red
                        }
                        // Check for markets
                        else if (markerTypeLower.includes('market') || categoryLower.includes('market') || markerTypeLower.includes('store')) {
                            MarkerComponent = <ShoppingBasket size={20} color="#FFF" fill="#FFF" />;
                            iconBgColor = '#22c55e'; // Variant 1 Green
                        }
                        // Check for fuel
                        else if (markerTypeLower.includes('fuel') || markerTypeLower.includes('gas') || categoryLower.includes('fuel')) {
                            MarkerComponent = <Fuel size={20} color="#FFF" fill="#FFF" />;
                            iconBgColor = '#1D8CF8'; // Variant 2 Classic Blue
                        }

                        return (
                            <Marker
                                key={`${activeCategory}-${marker.id}`}
                                coordinate={coord}
                                onPress={() => setSelectedNomad(marker)}
                                tracksViewChanges={true}
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 17,
                                    backgroundColor: activeCategory === 'nomads' ? '#FFF' : iconBgColor,
                                    borderWidth: 2,
                                    borderColor: activeCategory === 'nomads'
                                        ? (marker.sosActive ? '#EF4444' : marker.status === 'Active' ? colors.online : colors.primary)
                                        : '#FFF',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    elevation: 5,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 3,
                                }}>
                                    {activeCategory === 'nomads' ? (
                                        marker.sosActive ? (
                                            <AlertTriangle size={18} color="#EF4444" />
                                        ) : (
                                            <Image
                                                source={{ uri: marker.image || 'https://via.placeholder.com/100' }}
                                                style={{ width: 26, height: 26, borderRadius: 13 }}
                                            />
                                        )
                                    ) : (
                                        MarkerComponent
                                    )}
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>
            )}

            <SafeAreaView style={styles.topArea} edges={['top']}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search nomads, places..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/scan')} style={styles.scanBtn}>
                        <Zap size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'nomads' && { backgroundColor: colors.primary }]}
                        onPress={() => handleCategoryChange('nomads')}
                    >
                        <Zap size={14} color={activeCategory === 'nomads' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'nomads' && { color: colors.textSecondary }]}>Nomads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'mechanics' && { backgroundColor: colors.primary }]}
                        onPress={() => handleCategoryChange('mechanics')}
                    >
                        <Wrench size={14} color={activeCategory === 'mechanics' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'mechanics' && { color: colors.textSecondary }]}>Mechanics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'markets' && { backgroundColor: colors.primary }]}
                        onPress={() => handleCategoryChange('markets')}
                    >
                        <ShoppingCart size={14} color={activeCategory === 'markets' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'markets' && { color: colors.textSecondary }]}>Markets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'fuel' && { backgroundColor: colors.primary }]}
                        onPress={() => handleCategoryChange('fuel')}
                    >
                        <Fuel size={14} color={activeCategory === 'fuel' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'fuel' && { color: colors.textSecondary }]}>Fuel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <View style={styles.bottomArea}>
                <View style={styles.bottomHeader}>
                    <Text style={styles.bottomTitle}>Nearby</Text>
                    {!isPro && activeCategory === 'nomads' && (
                        <TouchableOpacity onPress={() => router.push('/paywall')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Crown size={14} color="#C5A059" />
                            <Text style={{ color: '#C5A059', fontSize: 12, fontWeight: '600' }}>See 50km+ with Pro</Text>
                        </TouchableOpacity>
                    )}
                    {(isPro || activeCategory !== 'nomads') && (
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.nomadScroll}
                    snapToInterval={width * 0.8 + 16}
                    decelerationRate="fast"
                >
                    {displayMarkers.map((item) => {
                        const itemLat = item.coordinate?.latitude || item.latitude;
                        const itemLng = item.coordinate?.longitude || item.longitude;

                        // Determine display values based on category
                        const isNomad = activeCategory === 'nomads';
                        const title = item.name;
                        const badgeText = isNomad ? item.vehicle : item.status; // Vehicle for nomads, Open/Closed for places
                        const subtitle = isNomad
                            ? (item.vehicle_model || item.vehicleModel)
                            : (item.address ? item.address.substring(0, 25) + (item.address.length > 25 ? '...' : '') : 'No address');

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.nomadCard}
                                onPress={() => setSelectedNomad(item)}
                            >
                                <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.nomadCardImage || styles.cardImage} />
                                <View style={styles.cardInfo}>
                                    <View style={styles.cardTop}>
                                        <Text style={styles.cardName} numberOfLines={1}>{title}</Text>
                                        {badgeText && (
                                            <View style={[styles.statusBadge, !isNomad && { backgroundColor: badgeText === 'Open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                                                <Text style={[styles.statusText, !isNomad && { color: badgeText === 'Open' ? '#22c55e' : '#ef4444' }]}>{badgeText}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.cardMeta}>
                                        {typeof item.distance === 'number' ? item.distance.toFixed(1) + 'km' : (item.distance || '?.? km')} • {subtitle}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.cardNavBtn}
                                        onPress={() => handleGetDirections(itemLat, itemLng, item.name)}
                                    >
                                        <Navigation size={14} color={colors.primary} fill={colors.primary} />
                                        <Text style={[styles.navBtnText, { color: colors.primary }]}>Get Directions</Text>
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
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        {selectedNomad && (
                            <View style={styles.detailContainer}>
                                <View style={styles.detailHeader}>
                                    <View style={styles.detailAvatarContainer}>
                                        <Image
                                            source={{ uri: selectedNomad.image || 'https://via.placeholder.com/150' }}
                                            style={styles.detailAvatar}
                                        />
                                        <View style={[styles.detailOnlineStatus, { backgroundColor: colors.online }]} />
                                    </View>
                                    <View style={styles.detailTitleInfo}>
                                        <Text style={styles.detailName}>{selectedNomad.name || 'Nomad'}</Text>
                                        <Text style={[styles.detailSubInfo, { color: colors.textSecondary }]}>
                                            {selectedNomad.status || 'Active'} • {
                                                typeof selectedNomad.distance === 'number'
                                                    ? selectedNomad.distance.toFixed(1) + ' km'
                                                    : (selectedNomad.distance || '?.? km')
                                            }
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.detailChatBtn}
                                        onPress={() => {
                                            setSelectedNomad(null);
                                            router.push({
                                                pathname: `/chat/${selectedNomad.id}`,
                                                params: {
                                                    name: selectedNomad.name,
                                                    avatar: selectedNomad.image
                                                }
                                            });
                                        }}
                                    >
                                        <MessageSquare size={24} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                {/* SOS Alert Banner */}
                                {(selectedNomad.sosActive || selectedNomad.isSOS) && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EF444420', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                                        <AlertTriangle size={18} color="#EF4444" />
                                        <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>SOS Active - Needs Roadside Help</Text>
                                    </View>
                                )}

                                <View style={styles.infoCardsRow}>
                                    <View style={styles.infoCard}>
                                        <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>VEHICLE</Text>
                                        <Text style={styles.infoCardValue}>
                                            {selectedNomad.vehicle_model || selectedNomad.vehicleModel || 'Caravan'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>ROUTE</Text>
                                        {selectedNomad.showRoute ? (
                                            <Text style={styles.infoCardValue}>{selectedNomad.route || 'Not specified'}</Text>
                                        ) : (
                                            <TouchableOpacity onPress={() => { setSelectedNomad(null); router.push('/paywall'); }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Crown size={12} color="#C5A059" />
                                                    <Text style={{ color: '#C5A059', fontSize: 12, fontWeight: '600' }}>Pro</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.mainActionBtn, { backgroundColor: colors.primary }]}
                                    onPress={async () => {
                                        try {
                                            const token = await AsyncStorage.getItem('userToken');
                                            if (!token) {
                                                Alert.alert("Error", "Please login first");
                                                return;
                                            }

                                            // Call backend service
                                            const result = await NotificationService.sendMeetingRequest(selectedNomad.id, token);

                                            if (result.success) {
                                                Alert.alert("Success", `Meeting request sent to ${selectedNomad.name}!`);
                                                setSelectedNomad(null);
                                            } else {
                                                Alert.alert("Error", result.message || "Failed to send request");
                                            }
                                        } catch (error) {
                                            console.error('Meeting request error:', error);
                                            Alert.alert("Error", "Failed to send meeting request");
                                        }
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

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    map: { ...StyleSheet.absoluteFillObject },
    loadingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: colors.textSecondary, marginTop: 10 },
    customMarker: { alignItems: 'center', overflow: 'visible' },
    markerPointer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible'
    },
    markerAvatar: { width: 26, height: 26, borderRadius: 13 },
    markerIcon: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    markerLabel: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 2 },
    markerText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
    topArea: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, zIndex: 10 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 15,
        paddingHorizontal: 12,
        height: 50,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: colors.text },
    scanBtn: { padding: 8, marginLeft: 5 },
    filterScroll: { paddingVertical: 12, marginTop: 8 },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    chipText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    bottomArea: { position: 'absolute', bottom: Platform.OS === 'ios' ? 90 : 70, left: 0, right: 0 },
    bottomHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
    bottomTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    seeAllText: { color: colors.primary, fontSize: 14 },
    nomadScroll: { paddingHorizontal: 16, gap: 12 },
    nomadCard: {
        width: width * 0.75,
        backgroundColor: colors.card,
        borderRadius: 24,
        flexDirection: 'row',
        padding: 14,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    cardImage: { width: 70, height: 70, borderRadius: 12 },
    cardInfo: { flex: 1, justifyContent: 'center' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    cardName: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    statusBadge: { backgroundColor: colors.primary + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusText: { color: colors.primary, fontSize: 9, fontWeight: 'bold' },
    cardMeta: { color: colors.textSecondary, fontSize: 12, marginVertical: 4 },
    cardNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    navBtnText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalHandle: { width: 45, height: 5, backgroundColor: colors.border, borderRadius: 2.5, alignSelf: 'center', marginVertical: 15 },
    detailContainer: { paddingHorizontal: 20 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    detailAvatarContainer: { position: 'relative' },
    detailAvatar: { width: 60, height: 60, borderRadius: 15 },
    detailOnlineStatus: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.background },
    detailTitleInfo: { flex: 1, marginLeft: 12 },
    detailName: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    detailSubInfo: { color: colors.textSecondary, fontSize: 13 },
    detailChatBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: colors.glassBackground, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder },
    infoCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    infoCard: { flex: 1, backgroundColor: colors.glassBackground, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: colors.glassBorder },
    infoCardLabel: { color: colors.textSecondary, fontSize: 10, marginBottom: 4 },
    infoCardValue: { color: colors.text, fontSize: 14, fontWeight: 'bold' },
    mainActionBtn: { backgroundColor: colors.primary, height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    mainActionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
