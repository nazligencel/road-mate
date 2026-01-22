import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { X, Zap, RefreshCw } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Kamera izni gerekiyor</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>İzin Ver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        setScanned(true);

        console.log('Scanned data:', data);

        // Normalize and check data
        const cleanData = data.trim();

        // Match both full URL and just ID
        if (cleanData.includes('road-mate://nomad/') || /^\d+$/.test(cleanData)) {
            const nomadId = cleanData.includes('road-mate://nomad/')
                ? cleanData.split('/').pop()
                : cleanData;

            // Navigate back to explore with the nomad ID
            router.replace({
                pathname: '/(tabs)/explore',
                params: { nomadId }
            });
        } else {
            alert(`Taranan veri: ${cleanData}\n\nGeçerli bir nomad profili bulunamadı. Lütfen Road Mate QR kodu kullandığınızdan emin olun.`);
            setTimeout(() => setScanned(false), 2000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Kod Tarat</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer} />
                        <View style={styles.middleRow}>
                            <View style={styles.unfocusedContainer} />
                            <View style={styles.focusedContainer}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                            <View style={styles.unfocusedContainer} />
                        </View>
                        <View style={styles.unfocusedContainer} />
                    </View>
                </CameraView>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Bir nomadın profilindeki QR kodu buraya hizalayın.
                </Text>
                {scanned && (
                    <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanBtn}>
                        <RefreshCw color="#FFF" size={20} />
                        <Text style={styles.rescanText}>Tekrar Tara</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraContainer: {
        flex: 1,
        overflow: 'hidden',
        marginHorizontal: 20,
        borderRadius: 30,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleRow: {
        flexDirection: 'row',
        height: width * 0.7,
    },
    focusedContainer: {
        width: width * 0.7,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: Colors.primary,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 15,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 15,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 15,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 15,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        margin: 20,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    rescanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        marginTop: 20,
    },
    rescanText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
