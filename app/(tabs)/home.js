import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Navigation, Flame, Plus, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { NomadService, ActivityService, UserService, NotificationService } from '../../services/api';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

const DUMMY_ACTIVITIES = [{
    id: 'dummy-1',
    title: 'Sunset Bonfire & Music',
    description: 'Gathering around the fire for some acoustic tunes and s\'mores.',
    location: 'Joshua Tree, CA',
    date: 'Today',
    time: '18:30',
    type: 'Social',
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=500&auto=format&fit=crop&q=60',
    creatorName: 'Alex Nomad',
    creatorImage: 'https://randomuser.me/api/portraits/men/32.jpg'
}, {
    id: 'dummy-2',
    title: 'Morning Mountain Hike',
    description: 'Early bird hike up the trail. Coffee included!',
    location: 'Aspen, CO',
    date: 'Tomorrow',
    time: '06:00',
    type: 'Adventure',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&auto=format&fit=crop&q=60',
    creatorName: 'Sarah Climber',
    creatorImage: 'https://randomuser.me/api/portraits/women/44.jpg'
}];

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#05080a" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#020617" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] }
];

const GlassCard = ({ children, style, intensity = 20, tint = 'dark' }) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1 }}>
            {children}
        </View>
    </View>
);

export default function HomeScreen() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [location, setLocation] = useState(null);
    const [nearbyNomads, setNearbyNomads] = useState([]);
    const [activities, setActivities] = useState(DUMMY_ACTIVITIES);
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [weather, setWeather] = useState(null);
    const [address, setAddress] = useState('Locating...');

    // Load data whenever the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    // Fetch User Profile
                    UserService.getUserDetails(token).then(setUser).catch(console.log);

                    // Fetch Activities
                    // Fetch Activities
                    // ActivityService.getActivities(token).then(data => {
                    //     if (data && data.length > 0) {
                    //         setActivities(data);
                    //     } else {
                    //         setActivities([]);
                    //     }
                    // }).catch(err => {
                    //     console.log('Activity fetch failed', err);
                    //      setActivities([{
                    //         id: 'dummy-1',
                    //         title: 'Sunset Bonfire & Music',
                    //         description: 'Gathering around the fire for some acoustic tunes and s\'mores.',
                    //         location: 'Joshua Tree, CA',
                    //         date: 'Today',
                    //         time: '18:30',
                    //         type: 'Social',
                    //         image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=500&auto=format&fit=crop&q=60',
                    //         creatorName: 'Alex Nomad',
                    //         creatorImage: 'https://randomuser.me/api/portraits/men/32.jpg'
                    //     }]);
                    // });

                    // Fetch Notifications
                    NotificationService.getUnreadCount(token).then(data => setUnreadCount(data.count)).catch(console.log);
                }
            };
            loadData();
        }, [])
    );

    useEffect(() => {
        let locationSubscription = null;
        let userToken = null;

        (async () => {
            try {
                userToken = await AsyncStorage.getItem('userToken');
                const enabled = await Location.hasServicesEnabledAsync();
                if (!enabled) return;

                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    locationSubscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Balanced,
                            timeInterval: 10000,
                            distanceInterval: 20,
                        },
                        async (newLocation) => {
                            setLocation(newLocation);

                            // Reverse Geocode
                            try {
                                const [place] = await Location.reverseGeocodeAsync({
                                    latitude: newLocation.coords.latitude,
                                    longitude: newLocation.coords.longitude
                                });
                                if (place) {
                                    setAddress(`${place.city || place.subregion}, ${place.region || place.country}`);
                                }
                            } catch (e) {
                                console.log('Geocode error:', e);
                            }

                            if (!isFetching) {
                                setIsFetching(true);
                                try {
                                    const nomads = await NomadService.getNearbyNomads(
                                        newLocation.coords.latitude,
                                        newLocation.coords.longitude,
                                        userToken
                                    );
                                    setNearbyNomads(nomads);
                                } catch (err) {
                                    console.log("Nomad Fetch Error:", err);
                                } finally {
                                    setIsFetching(false);
                                }
                                NomadService.updateLocation(
                                    newLocation.coords.latitude,
                                    newLocation.coords.longitude,
                                    userToken
                                );
                            }

                            // Weather
                            try {
                                const weatherResponse = await fetch(
                                    `https://api.open-meteo.com/v1/forecast?latitude=${newLocation.coords.latitude}&longitude=${newLocation.coords.longitude}&current_weather=true`
                                );
                                const weatherData = await weatherResponse.json();
                                if (weatherData.current_weather) {
                                    setWeather(Math.round(weatherData.current_weather.temperature));
                                }
                            } catch (err) { console.log("Weather Fetch Error:", err); }
                        }
                    ).catch(err => { console.log("WatchPosition Error:", err.message); });
                }
            } catch (error) { console.error("Home Location Error:", error.message); }
        })();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, []);

    const initialRegion = {
        latitude: location ? location.coords.latitude : 37.0322,
        longitude: location ? location.coords.longitude : 28.3242,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };
    return (
        <View style={styles.container}>
            {/* Background Gradient - Dark mode only */}
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: user?.profileImage || user?.image || 'https://via.placeholder.com/150' }}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.onlineDot} />
                                </View>
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.greetingText}>Hello, {user?.name?.split(' ')[0] || 'Nomad'}</Text>
                                <View style={styles.locationRow}>
                                    <MapPin size={12} color={colors.primary} />
                                    <Text style={styles.locationTitle}>{address}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.bellButton}
                            onPress={() => router.push('/notifications')}
                        >
                            <Bell size={24} color={colors.text} />
                            {unreadCount > 0 && <View style={styles.notificationDot} />}
                        </TouchableOpacity>
                    </View>

                    {/* Road Ahead / Real Map Card */}
                    <View style={styles.mapCardContainer}>
                        <View style={[styles.mapCard, { overflow: 'hidden' }]}>
                            <MapView
                                style={styles.mapBackground}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={initialRegion}
                                customMapStyle={mapStyle}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                showsUserLocation={true}
                                liteMode={Platform.OS === 'android'}
                            />
                            <LinearGradient
                                colors={['transparent', isDarkMode ? 'rgba(11, 19, 26, 0.9)' : 'rgba(255,255,255,0.9)']}
                                style={styles.mapOverlay}
                            />

                            <View style={styles.routeBadge}>
                                <View style={styles.pulsingDot} />
                                <Text style={styles.routeText}>On Route</Text>
                            </View>

                            <View style={styles.weatherBadge}>
                                <Text style={styles.weatherText}>☀️ {weather !== null ? `${weather}°C` : '--°C'}</Text>
                            </View>

                            <View style={styles.mapContent}>
                                <Text style={styles.sectionLabel}>ROAD AHEAD</Text>
                                <Text style={styles.nextStop}>Next: Grand Canyon South Rim</Text>

                                <View style={styles.mapFooter}>
                                    <View>
                                        <Text style={styles.metaLabel}>Remaining</Text>
                                        <Text style={styles.metaValue}>120 miles</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.navButton}
                                        onPress={() => router.push('/(tabs)/explore')}
                                    >
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
                            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                                <Text style={styles.seeAll}>View Map</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nomadScroll}>
                            {nearbyNomads.length > 0 ? nearbyNomads.map((nomad) => (
                                <TouchableOpacity key={nomad.id} style={styles.nomadItem}>
                                    <View style={styles.nomadImageContainer}>
                                        <Image source={{ uri: nomad.image }} style={styles.nomadImage} />
                                        {nomad.online && (
                                            <View style={styles.nomadOnlineBadge}>
                                                <View style={styles.lightningIcon}><Text style={{ fontSize: 8 }}>⚡</Text></View>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.nomadName}>{nomad.name} • {typeof nomad.distance === 'number' ? nomad.distance.toFixed(1) + 'km' : nomad.distance}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={{ color: colors.textSecondary, marginLeft: 20 }}>No one nearby...</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Campfire Feed */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Flame size={20} color={colors.secondary} fill={colors.secondary} />
                                <Text style={styles.sectionTitle}>Campfire Feed</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addActivityButton}
                                onPress={() => router.push('/create-activity')}
                            >
                                <Plus size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionSubtitle}>Local activities happening now</Text>

                        <View style={styles.feedList}>
                            {activities.length > 0 ? activities.map((item) => (
                                <TouchableOpacity key={item.id} onPress={() => router.push(`/activity/${item.id}`)}>
                                    <View style={styles.activityCard}>
                                        <Image
                                            source={{ uri: item.image || `https://source.unsplash.com/random/200x200?sig=${item.id}&camping` }}
                                            style={styles.activityImage}
                                        />
                                        <View style={styles.activityInfo}>
                                            <Text style={styles.activityTitle}>{item.title}</Text>
                                            <View style={styles.activityMeta}>
                                                <Text style={styles.activityTime}>{item.date} • {item.time}</Text>
                                            </View>
                                            <View style={styles.activityFooter}>
                                                <View style={styles.attendees}>
                                                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{item.location}</Text>
                                                </View>
                                                <TouchableOpacity style={styles.joinButton}>
                                                    <Text style={styles.joinText}>Join</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                    No activities nearby. Be the first to create one!
                                </Text>
                            )}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        borderColor: colors.primary,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.online,
        borderWidth: 2,
        borderColor: colors.background,
    },
    greetingText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    bellButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 2,
        right: 4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error,
        borderWidth: 2,
        borderColor: colors.background,
    },
    // Map Card
    mapCardContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    mapCard: {
        height: 220,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80%',
    },
    routeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(11, 19, 26, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
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
        backgroundColor: 'rgba(11, 19, 26, 0.6)',
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
        color: colors.primary,
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
        color: colors.textSecondary,
        fontSize: 12,
    },
    metaValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    navButton: {
        backgroundColor: colors.primary,
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
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },
    seeAll: {
        color: colors.primary,
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
        borderColor: colors.secondary,
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
        backgroundColor: colors.online,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    nomadName: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    // Feed
    sectionSubtitle: {
        paddingHorizontal: 20,
        color: colors.textSecondary,
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
        borderRadius: 20,
        padding: 12, // Restored original padding
        alignItems: 'center',
        gap: 16, // Restored original gap
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
        marginBottom: 12, // Kept compact margin
    },
    activityImage: {
        width: 80, // Restored original size
        height: 80, // Restored original size
        borderRadius: 16,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        color: colors.text,
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
        color: colors.textSecondary,
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
    joinButton: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    joinText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    organizerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    organizerName: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    joinButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    joinText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
    addActivityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
