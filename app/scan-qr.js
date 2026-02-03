import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Vibration } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Colors } from '../constants/Colors';
import { X, QrCode, Flashlight, FlashlightOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionService } from '../services/api';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanQRScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || isProcessing) return;

        setScanned(true);
        setIsProcessing(true);
        Vibration.vibrate(100);

        console.log('📷 QR Scanned:', data);

        // QR formatını kontrol et: road-mate://nomad/{userId}
        const qrPattern = /^road-mate:\/\/nomad\/(\d+)$/;
        const match = data.match(qrPattern);

        if (!match) {
            Alert.alert(
                'Geçersiz QR Kod',
                'Bu QR kodu Road Mate uygulamasına ait değil.',
                [{ text: 'Tamam', onPress: () => setScanned(false) }]
            );
            setIsProcessing(false);
            return;
        }

        const targetUserId = match[1];
        console.log('🎯 Target User ID:', targetUserId);

        try {
            // Token'ı al
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                Alert.alert(
                    'Giriş Gerekli',
                    'Bağlantı eklemek için giriş yapmalısınız.',
                    [
                        { text: 'İptal', onPress: () => router.back() },
                        { text: 'Giriş Yap', onPress: () => router.replace('/login') }
                    ]
                );
                setIsProcessing(false);
                return;
            }

            // Backend'e bağlantı isteği gönder
            const result = await ConnectionService.connectByQR(targetUserId, token);

            if (result.success) {
                Alert.alert(
                    '✅ Başarılı!',
                    result.message || 'Bağlantı isteği gönderildi!',
                    [{ text: 'Tamam', onPress: () => router.back() }]
                );
            } else {
                Alert.alert(
                    'Bilgi',
                    result.message || 'İşlem tamamlanamadı.',
                    [{ text: 'Tamam', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            console.error('QR Connection Error:', error);
            Alert.alert(
                'Hata',
                'Bağlantı kurulurken bir hata oluştu.',
                [{ text: 'Tamam', onPress: () => setScanned(false) }]
            );
        } finally {
            setIsProcessing(false);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Kamera izni isteniyor...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <QrCode size={80} color={Colors.textSecondary} />
                <Text style={styles.message}>Kamera izni gerekli</Text>
                <Text style={styles.subMessage}>
                    QR kod taramak için kamera erişimine izin verin.
                </Text>
                <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
                    <Text style={styles.buttonText}>İzin Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <Text style={styles.closeBtnText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                enableTorch={torch}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                        <X size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>QR Kod Tara</Text>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => setTorch(!torch)}>
                        {torch ? (
                            <Flashlight size={28} color={Colors.primary} />
                        ) : (
                            <FlashlightOff size={28} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Scan Area */}
                <View style={styles.scanAreaContainer}>
                    <View style={styles.scanArea}>
                        {/* Corner markers */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.instruction}>
                        {isProcessing ? 'İşleniyor...' : 'Diğer kullanıcının QR kodunu tarayın'}
                    </Text>
                    <Text style={styles.subInstruction}>
                        Profil sayfasındaki QR kodu çerçeveye yerleştirin
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    subMessage: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 30,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeBtn: {
        marginTop: 20,
    },
    closeBtnText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: Colors.primary,
    },
    topLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 20,
    },
    topRight: {
        top: -2,
        right: -2,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 20,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 20,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 20,
    },
    footer: {
        paddingBottom: 80,
        alignItems: 'center',
    },
    instruction: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    subInstruction: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
