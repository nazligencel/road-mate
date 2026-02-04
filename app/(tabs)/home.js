import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Bell, MapPin, Navigation, Flame, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { NomadService } from '../../services/api';
import { BlurView } from 'expo-blur';

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

const GlassCard = ({ children, style, intensity = 20 }) => (
    <View style={[styles.glassCardContainer, style]}>
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.glassCardContent}>
            {children}
        </View>
    </View>
);

export default function HomeScreen() {
    const [location, setLocation] = useState(null);
    const [nearbyNomads, setNearbyNomads] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        let locationSubscription = null;

        (async () => {
            try {
                const enabled = await Location.hasServicesEnabledAsync();
                if (!enabled) {
                    console.log("Location services are disabled");
                    return;
                }

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

                            if (!isFetching) {
                                setIsFetching(true);
                                try {
                                    const nomads = await NomadService.getNearbyNomads(
                                        newLocation.coords.latitude,
                                        newLocation.coords.longitude
                                    );
                                    setNearbyNomads(nomads);
                                } catch (err) {
                                    console.log("Nomad Fetch Error:", err);
                                } finally {
                                    setIsFetching(false);
                                }

                                NomadService.updateLocation(
                                    1,
                                    newLocation.coords.latitude,
                                    newLocation.coords.longitude
                                );
                            }

                            try {
                                const weatherResponse = await fetch(
                                    `https://api.open-meteo.com/v1/forecast?latitude=${newLocation.coords.latitude}&longitude=${newLocation.coords.longitude}&current_weather=true`
                                );
                                const weatherData = await weatherResponse.json();
                                if (weatherData.current_weather) {
                                    setWeather(Math.round(weatherData.current_weather.temperature));
                                }
                            } catch (err) {
                                console.log("Weather Fetch Error:", err);
                            }
                        }
                    ).catch(err => {
                        console.log("WatchPosition Error:", err.message);
                    });
                }
            } catch (error) {
                console.error("Home Location Error:", error.message);
            }
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
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
            {/* Background Gradient */}
            <LinearGradient
                colors={[Colors.background, '#1e293b', Colors.background]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <GlassCard style={styles.bellButton} intensity={15}>
                                <Bell size={20} color={Colors.text} />
                                <View style={styles.notificationDot} />
                            </GlassCard>
                        </TouchableOpacity>
                    </View>

                    {/* Road Ahead / Real Map Card */}
                    <View style={styles.mapCardContainer}>
                        <GlassCard style={styles.mapCard} intensity={10}>
                            <MapView
                                style={styles.mapBackground}
                                provider={PROVIDER_GOOGLE}
                                region={initialRegion}
                                customMapStyle={mapStyle}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                showsUserLocation={true}
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(11, 19, 26, 0.9)']}
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
                        </GlassCard>
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
                                <Text style={{ color: Colors.textSecondary, marginLeft: 20 }}>No one nearby...</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Campfire Feed */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Flame size={20} color={Colors.secondary} fill={Colors.secondary} />
                                <Text style={styles.sectionTitle}>Campfire Feed</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addActivityButton}
                                onPress={() => alert('Activity creation coming soon...')}
                            >
                                <Plus size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sectionSubtitle}>Local activities happening now</Text>

                        <View style={styles.feedList}>
                            {ACTIVITIES.map((item) => (
                                <GlassCard key={item.id} style={styles.activityCard}>
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
                                </GlassCard>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
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
        backgroundColor: Colors.online,
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
        justifyContent: 'center',
        alignItems: 'center',
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
    glassCardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.05)',
        }),
    },
    glassCardContent: {},
    // Map Card
    mapCardContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    mapCard: {
        height: 220,
        borderRadius: 24,
        // backgroundColor handled by GlassCard
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
        backgroundColor: Colors.primary,
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
        borderRadius: 20,
        padding: 12,
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
        backgroundColor: Colors.primary + '15',
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
    addActivityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
