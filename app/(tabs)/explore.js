import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput, ScrollView, Platform, Modal, ActivityIndicator, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Filter, Compass, Navigation, Zap, Wrench, ShoppingCart, ShoppingBag, ShoppingBasket, Fuel, MessageSquare, ArrowUpRight, Car, X, MapPin, AlertTriangle, Crown, Route, ShieldBan, User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { NomadService, PlacesService, NotificationService, SOSService, BlockService, ConnectionService, BASE_URL } from '../../services/api';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSettings } from '../../contexts/SettingsContext';

const { width, height } = Dimensions.get('window');

// Returns empty place categories — real data comes from API
const generateEmptyPlaces = () => {
    return { mechanics: [], markets: [], fuelStations: [], nomads: [] };
};

// Default location fallback
const DEFAULT_LAT = 41.0082;
const DEFAULT_LNG = 28.9784;

const darkMapStyle = [
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

const lightMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c8e6c9" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
    { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9e2f3" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

export default function ExploreScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const { isPro } = useSubscription();
    const { locationServices } = useSettings();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [selectedNomad, setSelectedNomad] = useState(null);
    const [nomadConnectionStatus, setNomadConnectionStatus] = useState('NONE');
    const [friendActionLoading, setFriendActionLoading] = useState(false);
    const [sosUsers, setSosUsers] = useState([]);
    const mapRef = useRef(null);
    const { focusLat, focusLng } = useLocalSearchParams();
    // Initialize with default location to prevent white screen if location fetch fails/delays
    const [location, setLocation] = useState({
        coords: {
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG
        }
    });
    const [loading, setLoading] = useState(false); // Do not block UI with loading state
    const [nearbyPlaces, setNearbyPlaces] = useState(() => generateEmptyPlaces());
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

                            // Animate map to user's actual location on first fix
                            if (!initialFetchDone && mapRef.current) {
                                mapRef.current.animateToRegion({
                                    latitude: newLocation.coords.latitude,
                                    longitude: newLocation.coords.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }, 1000);
                            }

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
                                    const nomadsWithType = (realNomads || []).map(n => ({ ...n, type: 'nomad' }));
                                    setNearbyPlaces(prev => ({ ...prev, nomads: nomadsWithType }));
                                    setActiveMarkers(nomadsWithType);
                                } catch (err) {
                                    console.log("Initial nomad fetch error:", err);
                                    setActiveMarkers([]);
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

    // Focus map on SOS location when navigated from notification
    useEffect(() => {
        if (focusLat && focusLng && mapRef.current) {
            const lat = parseFloat(focusLat);
            const lng = parseFloat(focusLng);
            if (!isNaN(lat) && !isNaN(lng)) {
                mapRef.current.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }, 1000);
            }
        }
    }, [focusLat, focusLng]);

    // Load connection status when a nomad is selected
    useEffect(() => {
        if (selectedNomad && activeCategory === 'nomads') {
            setNomadConnectionStatus('NONE');
            (async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (token) {
                        const result = await ConnectionService.getConnectionStatus(selectedNomad.id, token);
                        setNomadConnectionStatus(result.status || 'NONE');
                    }
                } catch (e) {
                    console.error('Error loading connection status:', e);
                }
            })();
        }
    }, [selectedNomad]);

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

        // Animate map: nomads wider view, places 10km view
        const delta = category === 'nomads' ? 0.15 : 0.09;
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
            }, 800);
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

                const nomadsWithType = (realNomads || []).map(n => ({ ...n, type: 'nomad' }));
                console.log('📍 Nomads loaded:', nomadsWithType.length, nomadsWithType.map(n => ({ id: n.id, lat: n.coordinate?.latitude || n.latitude, lng: n.coordinate?.longitude || n.longitude })));
                setActiveMarkers(nomadsWithType);
            } else {
                // Fetch places within 10km radius
                const realPlaces = await PlacesService.getNearbyPlaces(
                    location.coords.latitude,
                    location.coords.longitude,
                    category,
                    10000
                );

                console.log('📍 Places loaded:', category, (realPlaces || []).length, (realPlaces || []).slice(0, 2).map(p => ({ id: p.id, coord: p.coordinate })));
                if (realPlaces && realPlaces.length > 0) {
                    setActiveMarkers(realPlaces);
                } else {
                    setActiveMarkers([]);
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
        let filtered = activeMarkers;
        if (searchQuery.trim()) {
            const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
            filtered = activeMarkers.filter(item => {
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
        }
        // Sort by distance - closest first
        return [...filtered].sort((a, b) => {
            const distA = typeof a.distance === 'number' ? a.distance : 9999;
            const distB = typeof b.distance === 'number' ? b.distance : 9999;
            return distA - distB;
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
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={initialRegion}
                    customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
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
                            <View style={styles.sosMarker}>
                                <AlertTriangle size={20} color="#FFF" />
                            </View>
                        </Marker>
                    ))}

                    {displayMarkers.map((marker) => {
                        const coord = marker.coordinate || { latitude: marker.latitude, longitude: marker.longitude };
                        if (!coord.latitude || !coord.longitude) return null;

                        const isNomad = activeCategory === 'nomads';
                        const categoryLower = activeCategory.toLowerCase();
                        const markerTypeLower = (marker.type || '').toLowerCase();

                        let emoji = '📍';
                        let bgColor = colors.primary;

                        if (isNomad) {
                            emoji = marker.sosActive ? '🆘' : '';
                            bgColor = marker.sosActive ? '#EF4444' : colors.primary;
                        } else if (markerTypeLower.includes('mechanic') || categoryLower.includes('mechanic')) {
                            emoji = '🔧';
                            bgColor = '#e11d48';
                        } else if (markerTypeLower.includes('market') || categoryLower.includes('market') || markerTypeLower.includes('store')) {
                            emoji = '🛒';
                            bgColor = '#22c55e';
                        } else if (markerTypeLower.includes('fuel') || markerTypeLower.includes('gas') || categoryLower.includes('fuel')) {
                            emoji = '⛽';
                            bgColor = '#3B82F6';
                        }

                        return (
                            <Marker
                                key={`${activeCategory}-${marker.id}`}
                                coordinate={coord}
                                onPress={() => setSelectedNomad(marker)}
                                tracksViewChanges={false}
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={[styles.mapMarker, { backgroundColor: bgColor }]}>
                                    {isNomad && !marker.sosActive ? (
                                        <Text style={styles.mapMarkerInitial}>
                                            {(marker.name || '?').charAt(0).toUpperCase()}
                                        </Text>
                                    ) : (
                                        <Text style={styles.mapMarkerEmoji}>{emoji}</Text>
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
                        style={[styles.filterChip, activeCategory === 'nomads' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => handleCategoryChange('nomads')}
                        disabled={isFetching}
                    >
                        <Zap size={14} color={activeCategory === 'nomads' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'nomads' && { color: colors.textSecondary }]}>Nomads</Text>
                        {isFetching && activeCategory === 'nomads' && <ActivityIndicator size={12} color="#FFF" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'mechanics' && { backgroundColor: '#e11d48', borderColor: '#e11d48' }]}
                        onPress={() => handleCategoryChange('mechanics')}
                        disabled={isFetching}
                    >
                        <Wrench size={14} color={activeCategory === 'mechanics' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'mechanics' && { color: colors.textSecondary }]}>Mechanics</Text>
                        {isFetching && activeCategory === 'mechanics' && <ActivityIndicator size={12} color="#FFF" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'markets' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
                        onPress={() => handleCategoryChange('markets')}
                        disabled={isFetching}
                    >
                        <ShoppingCart size={14} color={activeCategory === 'markets' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'markets' && { color: colors.textSecondary }]}>Markets</Text>
                        {isFetching && activeCategory === 'markets' && <ActivityIndicator size={12} color="#FFF" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, activeCategory === 'fuel' && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]}
                        onPress={() => handleCategoryChange('fuel')}
                        disabled={isFetching}
                    >
                        <Fuel size={14} color={activeCategory === 'fuel' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.chipText, activeCategory !== 'fuel' && { color: colors.textSecondary }]}>Fuel</Text>
                        {isFetching && activeCategory === 'fuel' && <ActivityIndicator size={12} color="#FFF" />}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <View style={styles.bottomArea}>
                <View style={styles.bottomHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.bottomTitle}>Nearby</Text>
                        {displayMarkers.length > 0 && (
                            <View style={{ backgroundColor: colors.primary + '25', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{displayMarkers.length}</Text>
                            </View>
                        )}
                    </View>
                    {!isPro && activeCategory === 'nomads' && (
                        <TouchableOpacity onPress={() => router.push('/paywall')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Crown size={14} color="#C5A059" />
                            <Text style={{ color: '#C5A059', fontSize: 12, fontWeight: '600' }}>Unlock 50km+</Text>
                        </TouchableOpacity>
                    )}
                    {activeCategory !== 'nomads' && (
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Within 10 km</Text>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.nomadScroll}
                    snapToInterval={width * 0.8 + 12}
                    decelerationRate="fast"
                >
                    {isFetching && (
                        <View style={{ width: width * 0.8, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>Searching nearby...</Text>
                        </View>
                    )}
                    {!isFetching && displayMarkers.length === 0 && (
                        <View style={{ width: width * 0.8, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No results found nearby</Text>
                        </View>
                    )}
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
                                <Image source={{ uri: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : 'https://via.placeholder.com/150' }} style={styles.nomadCardImage} />
                                <View style={styles.cardInfo}>
                                    <View style={styles.cardTop}>
                                        <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                                        {badgeText && (
                                            <View style={[styles.statusBadge, !isNomad && { backgroundColor: badgeText === 'Open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                                                <Text style={[styles.statusText, !isNomad && { color: badgeText === 'Open' ? '#22c55e' : '#ef4444' }]} numberOfLines={1}>{badgeText}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.cardMeta} numberOfLines={1}>
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
                                            source={{ uri: selectedNomad.image ? (selectedNomad.image.startsWith('http') ? selectedNomad.image : `${BASE_URL}${selectedNomad.image}`) : 'https://via.placeholder.com/150' }}
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
                                    <View style={styles.sosBanner}>
                                        <AlertTriangle size={18} color="#EF4444" />
                                        <Text style={styles.sosBannerText}>SOS Active - Needs Roadside Help</Text>
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
                                        <Text style={styles.infoCardValue} numberOfLines={1}>{selectedNomad.route || 'Not set'}</Text>
                                    </View>
                                </View>

                                {/* View Profile Button */}
                                {activeCategory === 'nomads' && (
                                    <TouchableOpacity
                                        style={styles.viewProfileBtn}
                                        onPress={() => {
                                            const nomadId = selectedNomad.id;
                                            setSelectedNomad(null);
                                            router.push({ pathname: '/user-profile', params: { id: nomadId } });
                                        }}
                                    >
                                        <UserIcon size={18} color={colors.primary} />
                                        <Text style={[styles.viewProfileBtnText, { color: colors.primary }]}>View Profile</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Add Friend Button */}
                                {activeCategory === 'nomads' && nomadConnectionStatus !== 'FRIENDS' && (
                                    <TouchableOpacity
                                        style={[styles.viewProfileBtn, {
                                            borderColor: nomadConnectionStatus === 'PENDING_SENT' ? colors.textSecondary : '#22c55e',
                                        }]}
                                        disabled={friendActionLoading || nomadConnectionStatus === 'PENDING_SENT'}
                                        onPress={async () => {
                                            if (friendActionLoading) return;
                                            setFriendActionLoading(true);
                                            try {
                                                const token = await AsyncStorage.getItem('userToken');
                                                if (!token) return;
                                                if (nomadConnectionStatus === 'NONE') {
                                                    const result = await ConnectionService.sendConnectionRequest(selectedNomad.id, token);
                                                    if (result.success) setNomadConnectionStatus('PENDING_SENT');
                                                } else if (nomadConnectionStatus === 'PENDING_RECEIVED') {
                                                    const pending = await ConnectionService.getPendingRequests(token);
                                                    const match = pending.find(c => c.user?.id?.toString() === selectedNomad.id?.toString());
                                                    if (match) {
                                                        const result = await ConnectionService.acceptConnection(match.id, token);
                                                        if (result.success) setNomadConnectionStatus('FRIENDS');
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Friend action error:', error);
                                            } finally {
                                                setFriendActionLoading(false);
                                            }
                                        }}
                                    >
                                        {friendActionLoading ? (
                                            <ActivityIndicator size="small" color={colors.primary} />
                                        ) : nomadConnectionStatus === 'PENDING_SENT' ? (
                                            <>
                                                <Text style={[styles.viewProfileBtnText, { color: colors.textSecondary }]}>Request Sent</Text>
                                            </>
                                        ) : nomadConnectionStatus === 'PENDING_RECEIVED' ? (
                                            <>
                                                <Text style={[styles.viewProfileBtnText, { color: '#22c55e' }]}>Accept Request</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Text style={[styles.viewProfileBtnText, { color: '#22c55e' }]}>Add Friend</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}

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

                                {/* Block User Button */}
                                {activeCategory === 'nomads' && (
                                    <TouchableOpacity
                                        style={styles.blockUserBtn}
                                        onPress={() => {
                                            Alert.alert(
                                                'Block User',
                                                `Are you sure you want to block ${selectedNomad.name || 'this user'}?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Block',
                                                        style: 'destructive',
                                                        onPress: async () => {
                                                            try {
                                                                const token = await AsyncStorage.getItem('userToken');
                                                                if (token) {
                                                                    const result = await BlockService.blockUser(selectedNomad.id, token);
                                                                    if (result.success) {
                                                                        // Remove from markers immediately
                                                                        setActiveMarkers(prev => prev.filter(m => m.id !== selectedNomad.id));
                                                                        setSelectedNomad(null);
                                                                    } else {
                                                                        Alert.alert('Error', result.error || 'Failed to block user');
                                                                    }
                                                                }
                                                            } catch (error) {
                                                                Alert.alert('Error', 'Failed to block user');
                                                            }
                                                        }
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <ShieldBan size={16} color="#EF4444" />
                                        <Text style={styles.blockUserBtnText}>Block User</Text>
                                    </TouchableOpacity>
                                )}
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
        width: width * 0.8,
        backgroundColor: colors.card,
        borderRadius: 24,
        flexDirection: 'row',
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    nomadCardImage: { width: 65, height: 65, borderRadius: 12 },
    cardImage: { width: 65, height: 65, borderRadius: 12 },
    cardInfo: { flex: 1, justifyContent: 'center' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
    cardName: { color: colors.text, fontSize: 15, fontWeight: 'bold', flex: 1, flexShrink: 1 },
    statusBadge: { backgroundColor: colors.primary + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexShrink: 0 },
    statusText: { color: colors.primary, fontSize: 10, fontWeight: 'bold' },
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
    viewProfileBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, height: 48, borderRadius: 15, borderWidth: 1.5, borderColor: colors.primary, marginBottom: 10 },
    viewProfileBtnText: { fontWeight: 'bold', fontSize: 15 },
    mainActionBtn: { backgroundColor: colors.primary, height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    mainActionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    blockUserBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 10 },
    blockUserBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
    sosMarker: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#EF4444', borderWidth: 3, borderColor: '#FCA5A5',
        justifyContent: 'center', alignItems: 'center',
        elevation: 8, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6, shadowRadius: 10,
    },
    mapMarker: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#FFF',
    },
    mapMarkerInitial: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    mapMarkerEmoji: { fontSize: 18 },
    // Legacy (keep for backward compat)
    markerBubble: {
        width: 34, height: 34, borderRadius: 17,
        borderWidth: 2, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, shadowRadius: 3,
    },
    markerAvatarImage: { width: 26, height: 26, borderRadius: 13 },
    sosBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#EF444420', padding: 12, borderRadius: 12, marginBottom: 16,
    },
    sosBannerText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});
