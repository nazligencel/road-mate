import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Upload, Check, ChevronDown, Zap, Hammer, Droplets, Wrench } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDiscussions } from '../contexts/DiscussionContext';
import { DiscussionService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = [
    { id: 1, name: 'Electrical', icon: Zap, color: '#F59E0B' },
    { id: 2, name: 'Carpentry', icon: Hammer, color: '#8B5CF6' },
    { id: 3, name: 'Plumbing', icon: Droplets, color: '#3B82F6' },
    { id: 4, name: 'Mechanical', icon: Wrench, color: '#EF4444' },
];

export default function CreateDiscussionScreen() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { addDiscussion } = useDiscussions();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !description.trim() || !selectedCategory) {
            Alert.alert('Missing Fields', 'Please fill in all fields (Title, Category, Description).');
            return;
        }

        const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'General';

        setSubmitting(true);
        try {
            let imageUrl = null;

            // Upload image first if selected
            if (image) {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    try {
                        const uploadResult = await DiscussionService.uploadDiscussionImage(image, token);
                        imageUrl = uploadResult.imageUrl;
                    } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);
                        // Continue without image
                    }
                }
            }

            await addDiscussion({
                title,
                preview: description,
                tag: categoryName,
                image: imageUrl,
            });

            router.back();
        } catch (error) {
            console.error('Create discussion error:', error);
            Alert.alert('Error', 'Failed to create discussion. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            {isDarkMode ? (
                <LinearGradient
                    colors={[colors.background, '#1e293b', colors.background]}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F5F8' }]} />
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Discussion</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Topic Selection */}
                <Text style={styles.label}>Select Topic</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)}>
                                <View style={[
                                    styles.categoryCard,
                                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '20' }
                                ]}>
                                    <cat.icon color={isSelected ? colors.primary : cat.color} size={20} />
                                    <Text style={[
                                        styles.categoryName,
                                        isSelected && { color: colors.primary }
                                    ]}>{cat.name}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Title Input */}
                <Text style={styles.label}>Discussion Title</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="e.g. Solar panel wiring types..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Description Input */}
                <Text style={styles.label}>Description</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                    <TextInput
                        placeholder="Describe your issue or question in detail..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Image Upload */}
                <Text style={styles.label}>Add Photo (Optional)</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.uploadedImage} />
                    ) : (
                        <View style={{ alignItems: 'center', gap: 8 }}>
                            <Upload color={colors.textSecondary} size={32} />
                            <Text style={styles.uploadText}>Tap to upload image</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Submit Button - Fixed at bottom */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleCreate}
                    disabled={submitting}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.online]}
                        style={styles.submitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Post Discussion</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
        marginTop: 20,
    },
    categoriesScroll: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.glassBackground,
    },
    categoryName: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    inputContainer: {
        backgroundColor: colors.glassBackground,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        justifyContent: 'center',
    },
    input: {
        color: colors.text,
        fontSize: 16,
    },
    textAreaContainer: {
        height: 150,
        paddingVertical: 16,
    },
    textArea: {
        height: '100%',
    },
    uploadBox: {
        height: 200,
        borderWidth: 2,
        borderColor: colors.cardBorder,
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.glassBackground,
        overflow: 'hidden',
    },
    uploadText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    submitBtn: {
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitGradient: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
