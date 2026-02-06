import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiscussionService } from '../services/api';

const DiscussionContext = createContext();

const INITIAL_DISCUSSIONS = [
    {
        id: 1,
        title: 'Help with Solar Setup?',
        author: 'NewbieVan',
        replies: 24,
        tag: 'Electrical',
        preview: 'I have 200W panels but my battery keeps draining...',
        time: '2h ago',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80'
    },
    {
        id: 2,
        title: 'Best insulation for cold climates?',
        author: 'SnowSeeker',
        replies: 12,
        tag: 'Carpentry',
        preview: 'Looking at Havelock wool vs Spray foam. Thoughts?',
        time: '5h ago'
    },
    {
        id: 3,
        title: 'Leaking water pump',
        author: 'RoadRunner',
        replies: 8,
        tag: 'Plumbing',
        preview: 'My Shurflo pump is pulsing and leaking at the fitting. Any quick fixes?',
        time: '1d ago'
    },
    {
        id: 4,
        title: 'Engine overheating on grades',
        author: 'VanLife99',
        replies: 35,
        tag: 'Mechanical',
        preview: '2015 Sprinter gets hot when climbing steep hills. Coolant is full.',
        time: '2d ago'
    },
    {
        id: 5,
        title: 'Cabinet latch recommendations',
        author: 'WoodWorks',
        replies: 15,
        tag: 'Carpentry',
        preview: 'Need heavy duty latches that wont open while driving on washboard roads.',
        time: '3d ago'
    },
];

// Map backend DTO to frontend format
const mapDtoToDiscussion = (dto) => ({
    id: dto.id,
    title: dto.title,
    preview: dto.description,
    tag: dto.tag,
    image: dto.image,
    author: dto.creatorName || 'Unknown',
    authorImage: dto.creatorImage,
    creatorId: dto.creatorId,
    replies: dto.commentCount || 0,
    time: dto.timeAgo || 'Just now',
    isSaved: dto.isSaved || false,
});

export function DiscussionProvider({ children }) {
    const [discussions, setDiscussions] = useState(INITIAL_DISCUSSIONS);
    const [savedIds, setSavedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDiscussions = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) return; // Not logged in, keep local data

            const data = await DiscussionService.getDiscussions(token);
            if (data && data.length > 0) {
                const mapped = data.map(mapDtoToDiscussion);
                setDiscussions(mapped);
                // Update savedIds from backend data
                const saved = data.filter(d => d.isSaved).map(d => d.id);
                setSavedIds(saved);
            }
        } catch (error) {
            console.error('Failed to fetch discussions:', error);
            // Keep local fallback data
        } finally {
            setLoading(false);
        }
    }, []);

    const addDiscussion = useCallback(async (discussion) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const created = await DiscussionService.createDiscussion({
                    title: discussion.title,
                    description: discussion.preview,
                    tag: discussion.tag,
                    image: discussion.image || null,
                }, token);
                const mapped = mapDtoToDiscussion(created);
                setDiscussions(prev => [mapped, ...prev]);
                return mapped;
            }
        } catch (error) {
            console.error('Failed to create discussion via API:', error);
        }

        // Fallback: add locally
        const newDiscussion = {
            id: Date.now(),
            replies: 0,
            time: 'Just now',
            author: 'You',
            ...discussion
        };
        setDiscussions(prev => [newDiscussion, ...prev]);
        return newDiscussion;
    }, []);

    const toggleSave = useCallback(async (id) => {
        // Optimistic update
        setSavedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });

        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await DiscussionService.toggleBookmark(id, token);
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            // Revert optimistic update
            setSavedIds(prev => {
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id);
                } else {
                    return [...prev, id];
                }
            });
        }
    }, []);

    return (
        <DiscussionContext.Provider value={{
            discussions,
            addDiscussion,
            savedIds,
            toggleSave,
            fetchDiscussions,
            loading,
        }}>
            {children}
        </DiscussionContext.Provider>
    );
}

export const useDiscussions = () => {
    const context = useContext(DiscussionContext);
    if (!context) {
        throw new Error('useDiscussions must be used within a DiscussionProvider');
    }
    return context;
};
