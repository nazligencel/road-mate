import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';
import { ArrowLeft, Calendar, MapPin, AlignLeft, Type, Clock, Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityService, PlacesService } from '../services/api';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';

export default function CreateActivityScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const [loading, setLoading] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        type: 'Social',
        image: null
    });

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const locationTimeout = React.useRef(null);

    const handleLocationChange = (text) => {
        setFormData({ ...formData, location: text });

        if (locationTimeout.current) clearTimeout(locationTimeout.current);

        if (text.length < 2) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        locationTimeout.current = setTimeout(async () => {
            const suggestions = await PlacesService.autocomplete(text);
            setLocationSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        }, 300);
    };

    const selectLocation = (suggestion) => {
        setFormData({ ...formData, location: suggestion.description });
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setFormData({ ...formData, image: result.assets[0].uri });
        }
    };

    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.location.trim() || !formData.date) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'You must be logged in to create an activity.');
                return;
            }

            let imageUrl = null;
            if (formData.image) {
                try {
                    const uploadResult = await ActivityService.uploadActivityImage(formData.image, token);
                    imageUrl = uploadResult.imageUrl;
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    // Continue without image
                }
            }

            await ActivityService.createActivity({ ...formData, image: imageUrl }, token);
            Alert.alert('Success', 'Activity created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to create activity.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDate = (date) => {
        setFormData({ ...formData, date: date.toISOString().split('T')[0] });
        setDatePickerVisibility(false);
    };

    const handleConfirmTime = (time) => {
        setFormData({
            ...formData,
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setTimePickerVisibility(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Activity</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

                        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                            {formData.image ? (
                                <Image source={{ uri: formData.image }} style={styles.previewImage} />
                            ) : (
                                <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9' }]}>
                                    <Camera size={32} color={colors.textSecondary} />
                                    <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>Add Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>TITLE</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9' }]}>
                                <Type size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Morning Yoga, Coffee Meetup..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                    maxLength={200}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 10 }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>LOCATION</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9' }]}>
                                <MapPin size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Istanbul, Berlin, Paris..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.location}
                                    onChangeText={handleLocationChange}
                                />
                            </View>
                            {showSuggestions && (
                                <View style={[styles.suggestionsContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#FFF', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                                    {locationSuggestions.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.placeId || index}
                                            style={[styles.suggestionItem, index < locationSuggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
                                            onPress={() => selectLocation(item)}
                                        >
                                            <MapPin size={16} color={colors.textSecondary} />
                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <Text style={[styles.suggestionMain, { color: colors.text }]}>{item.mainText}</Text>
                                                {item.secondaryText ? <Text style={[styles.suggestionSecondary, { color: colors.textSecondary }]}>{item.secondaryText}</Text> : null}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>DATE</Text>
                                <TouchableOpacity
                                    onPress={() => setDatePickerVisibility(true)}
                                    style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9' }]}
                                >
                                    <Calendar size={20} color={colors.textSecondary} />
                                    <Text style={[styles.inputText, { color: formData.date ? colors.text : colors.textSecondary }]}>
                                        {formData.date || 'YYYY-MM-DD'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>TIME</Text>
                                <TouchableOpacity
                                    onPress={() => setTimePickerVisibility(true)}
                                    style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9' }]}
                                >
                                    <Clock size={20} color={colors.textSecondary} />
                                    <Text style={[styles.inputText, { color: formData.time ? colors.text : colors.textSecondary }]}>
                                        {formData.time || 'HH:MM'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirmDate}
                            onCancel={() => setDatePickerVisibility(false)}
                            isDarkModeEnabled={isDarkMode}
                        />

                        <DateTimePickerModal
                            isVisible={isTimePickerVisible}
                            mode="time"
                            onConfirm={handleConfirmTime}
                            onCancel={() => setTimePickerVisibility(false)}
                            isDarkModeEnabled={isDarkMode}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F1F5F9', alignItems: 'flex-start', paddingVertical: 12, height: 100 }]}>
                                <AlignLeft size={20} color={colors.textSecondary} style={{ marginTop: 2 }} />
                                <TextInput
                                    style={[styles.input, { color: colors.text, height: '100%', textAlignVertical: 'top' }]}
                                    placeholder="Tell people what to expect..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    multiline
                                    maxLength={2000}
                                />
                            </View>
                        </View>

                    </View>

                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Activity</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 8,
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        height: '100%',
        textAlignVertical: 'center', // Fix for Android input alignment
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        textAlignVertical: 'center', // Fix for Android text alignment
        includeFontPadding: false, // Fix vertical rhythm on Android
        paddingTop: 0, // Remove any default padding
    },
    row: {
        flexDirection: 'row',
    },
    createButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    imagePlaceholderText: {
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionsContainer: {
        marginTop: 4,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    suggestionMain: {
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionSecondary: {
        fontSize: 12,
        marginTop: 2,
    },
});
