import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Dimensions, Modal } from 'react-native';
import React, { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { Settings, Edit2, LogOut, Camera, Grid, QrCode } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

const PHOTOS = [
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=300&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=300&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&q=80',
];

export default function ProfileScreen() {
    const [qrVisible, setQrVisible] = useState(false);
    const userId = "1"; // Matching Selin's ID in NEARBY_NOMADS for demo

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={() => setQrVisible(true)}>
                        <QrCode color={Colors.text} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Settings color={Colors.text} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.editBtn}>
                        <Edit2 size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>Alex Roamer</Text>
                <Text style={styles.bio}>Digital Nomad & Van Builder. Living in a 2018 Sprinter.</Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>245</Text>
                        <Text style={styles.statLabel}>Connections</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Build Posts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.premiumBanner}>
                    <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumDesc}>See who liked you & unlimited swipes</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.gallerySection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Gallery</Text>
                    <TouchableOpacity>
                        <Camera size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.grid}>
                    {PHOTOS.map((img, i) => (
                        <Image key={i} source={{ uri: img }} style={styles.gridImage} />
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn}>
                <LogOut size={20} color={Colors.error} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* QR Modal */}
            <Modal
                visible={qrVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setQrVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setQrVisible(false)}
                >
                    <View style={styles.qrContainer}>
                        <Text style={styles.qrTitle}>My Connection QR</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={`road-mate://nomad/${userId}`}
                                size={200}
                                color={Colors.background}
                                backgroundColor="#FFF"
                            />
                        </View>
                        <Text style={styles.qrDesc}>Other nomads can scan this to connect with you.</Text>
                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setQrVisible(false)}>
                            <Text style={styles.closeModalText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
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
    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: Colors.card,
    },
    editBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: Colors.background,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        width: '100%',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.border,
    },
    premiumBanner: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(244, 63, 94, 0.3)',
        alignItems: 'center',
    },
    premiumTitle: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    premiumDesc: {
        color: Colors.primary,
        fontSize: 12,
        opacity: 0.8,
    },
    gallerySection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridImage: {
        width: (Dimensions.get('window').width - 48 - 12) / 2,
        height: 150,
        borderRadius: 12,
        backgroundColor: Colors.card,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 40,
    },
    logoutText: {
        color: Colors.error,
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: Colors.card,
        padding: 30,
        borderRadius: 30,
        alignItems: 'center',
        width: '80%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    qrTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 20,
    },
    qrDesc: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
    },
    closeModalBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 15,
    },
    closeModalText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
