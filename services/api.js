import Constants from 'expo-constants';
import { Platform } from 'react-native';


// Production backend URL — set this after deploying backend
const PRODUCTION_API_URL = 'https://road-mate-backend-production.up.railway.app';

const getApiUrl = () => {
    // Use production URL if set
    if (PRODUCTION_API_URL) {
        return PRODUCTION_API_URL;
    }

    // Development: auto-detect from Expo debugger host
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

    let ip = localhost;

    // Android Emulator special IP
    if (Platform.OS === 'android' && (ip === 'localhost' || ip === '127.0.0.1')) {
        ip = '10.0.2.2';
    }

    return `http://${ip}:5000`;
};

export const BASE_URL = getApiUrl();
console.log('📡 BASE URL set to:', BASE_URL);

export const NomadService = {
    async getNearbyNomads(lat, lng, token = null) {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/api/nearby-nomads?lat=${lat}&lng=${lng}`, {
                headers
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Fetch Nomads Failed (${response.status}):`, errorData);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching nomads:', error);
            return [];
        }
    },

    async updateLocation(lat, lng, token = null) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/api/update-location`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ latitude: lat, longitude: lng }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Update Location Failed (${response.status}):`, errorData);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false };
        }
    }
};

// Places Service - Calls backend which proxies to Google Places API (API key stays secure on server)
export const PlacesService = {
    async getNearbyPlaces(lat, lng, category, radius = 5000) {
        try {
            const url = `${BASE_URL}/api/places/nearby?lat=${lat}&lng=${lng}&category=${category}&radius=${radius}`;
            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching places from backend:', error);
            return [];
        }
    },

    async autocomplete(input) {
        try {
            if (!input || input.length < 2) return [];
            const url = `${BASE_URL}/api/places/autocomplete?input=${encodeURIComponent(input)}`;
            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching autocomplete:', error);
            return [];
        }
    }
};

// Connection Service - QR bağlantı sistemi
export const ConnectionService = {
    /**
     * QR tarandığında bağlantı isteği gönder
     */
    async connectByQR(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/scan/${targetUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('❌ QR Connection Failed:', data.message);
                return { success: false, message: data.message };
            }

            console.log('✅ QR Connection Success:', data);
            return data;
        } catch (error) {
            console.error('Error connecting by QR:', error);
            return { success: false, message: 'Bağlantı hatası' };
        }
    },

    /**
     * Kullanıcının bağlantılarını getir
     */
    async getMyConnections(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Get Connections Failed');
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting connections:', error);
            return [];
        }
    },

    /**
     * Bekleyen bağlantı isteklerini getir
     */
    async getPendingRequests(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Get Pending Failed');
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting pending requests:', error);
            return [];
        }
    },

    /**
     * Bağlantı sayısını getir
     */
    async getConnectionCount(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return { count: 0 };
            return await response.json();
        } catch (error) {
            console.error('Error getting connection count:', error);
            return { count: 0 };
        }
    },

    /**
     * Bağlantı isteğini kabul et
     */
    async acceptConnection(connectionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/${connectionId}/accept`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error accepting connection:', error);
            return { success: false };
        }
    },

    /**
     * Bağlantı isteğini reddet
     */
    async rejectConnection(connectionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/${connectionId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error rejecting connection:', error);
            return { success: false };
        }
    },

    async sendConnectionRequest(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/request/${targetUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message };
            }
            return data;
        } catch (error) {
            console.error('Error sending connection request:', error);
            return { success: false, message: 'Connection error' };
        }
    },

    async getConnectionStatus(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/status/${targetUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) return { status: 'NONE' };
            return await response.json();
        } catch (error) {
            console.error('Error getting connection status:', error);
            return { status: 'NONE' };
        }
    },

    async removeConnection(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/connections/user/${targetUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error removing connection:', error);
            return { success: false };
        }
    }
};

export const UserService = {
    async uploadProfileImage(imageUri, token) {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('file', { uri: imageUri, name: filename, type });

            const response = await fetch(`${BASE_URL}/api/users/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload profile image error:', error);
            throw error;
        }
    },

    async uploadGalleryImage(imageUri, token) {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('file', { uri: imageUri, name: filename, type });

            const response = await fetch(`${BASE_URL}/api/users/gallery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload gallery image error:', error);
            throw error;
        }
    },

    async getUserDetails(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch user details');
            return await response.json();
        } catch (error) {
            console.error('Get user details error:', error);
            throw error;
        }
    },

    async updateProfile(userData, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Update failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    async registerPushToken(pushToken, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/push-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pushToken })
            });
            if (!response.ok) throw new Error('Failed to register push token');
            return await response.json();
        } catch (error) {
            console.error('Register push token error:', error);
            throw error;
        }
    },

    async getGalleryPhotos(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/gallery`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch gallery');
            return await response.json();
        } catch (error) {
            console.error('Get gallery photos error:', error);
            throw error;
        }
    },

    async deleteGalleryImage(imageId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/gallery/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Delete failed');
            }
            return true;
        } catch (error) {
            console.error('Delete gallery image error:', error);
            throw error;
        }
    },

    async getVehiclePhotos(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/vehicle-images`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch vehicle photos');
            return await response.json();
        } catch (error) {
            console.error('Get vehicle photos error:', error);
            throw error;
        }
    },

    async uploadVehicleImage(imageUri, token) {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('file', { uri: imageUri, name: filename, type });

            const response = await fetch(`${BASE_URL}/api/users/vehicle-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload vehicle image error:', error);
            throw error;
        }
    },

    async deleteVehicleImage(imageId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/vehicle-image/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Delete failed');
            }
            return true;
        } catch (error) {
            console.error('Delete vehicle image error:', error);
            throw error;
        }
    },

    async getPublicProfile(userId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/users/${userId}/public-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch public profile');
            return await response.json();
        } catch (error) {
            console.error('Get public profile error:', error);
            throw error;
        }
    }
};

export const NotificationService = {
    async sendMeetingRequest(targetUserId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/meeting-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send meeting request');
            return data;
        } catch (error) {
            console.error('Send meeting request error:', error);
            throw error;
        }
    },

    async getNotifications(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get notifications error:', error);
            return [];
        }
    },

    async getUnreadCount(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return { count: 0 };
            return await response.json();
        } catch (error) {
            console.error('Get unread count error:', error);
            return { count: 0 };
        }
    },

    async markAllAsRead(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.ok;
        } catch (error) {
            console.error('Mark all read error:', error);
            return false;
        }
    }
};

export const MessageService = {
    async getConversations(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get conversations error:', error);
            return [];
        }
    },

    async getConversation(userId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/messages/conversation/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get conversation error:', error);
            return [];
        }
    },

    async sendMessage(receiverId, content, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId, content })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send message');
            return data;
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },

    async getUnreadCount(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/messages/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return { count: 0 };
            return await response.json();
        } catch (error) {
            console.error('Get unread count error:', error);
            return { count: 0 };
        }
    }
};

export const DiscussionService = {
    async getDiscussions(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get discussions error:', error);
            return [];
        }
    },

    async getDiscussion(id, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch discussion');
            return await response.json();
        } catch (error) {
            console.error('Get discussion error:', error);
            throw error;
        }
    },

    async createDiscussion(data, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create discussion');
            return result;
        } catch (error) {
            console.error('Create discussion error:', error);
            throw error;
        }
    },

    async uploadDiscussionImage(imageUri, token) {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('file', { uri: imageUri, name: filename, type });

            const response = await fetch(`${BASE_URL}/api/discussions/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload discussion image error:', error);
            throw error;
        }
    },

    async getComments(discussionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions/${discussionId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get comments error:', error);
            return [];
        }
    },

    async addComment(discussionId, text, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions/${discussionId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to add comment');
            return data;
        } catch (error) {
            console.error('Add comment error:', error);
            throw error;
        }
    },

    async toggleBookmark(discussionId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions/${discussionId}/bookmark`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Toggle bookmark error:', error);
            return { success: false };
        }
    },

    async getSavedDiscussions(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/discussions/saved`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get saved discussions error:', error);
            return [];
        }
    }
};

export const ActivityService = {
    async getActivities(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/activities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get activities error:', error);
            return [];
        }
    },

    async createActivity(activityData, token) {
        try {
            console.log('🚀 Creating activity:', activityData);
            const response = await fetch(`${BASE_URL}/api/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(activityData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create activity');
            return data;
        } catch (error) {
            console.error('Create activity error:', error);
            throw error;
        }
    },

    async uploadActivityImage(imageUri, token) {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            const uri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

            formData.append('file', { uri, name: filename, type });

            const response = await fetch(`${BASE_URL}/api/activities/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload activity image error:', error);
            throw error;
        }
    },

    async joinActivity(activityId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/activities/${activityId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Join activity error:', error);
            return { success: false };
        }
    },

    async getActivity(activityId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch activity');
            return await response.json();
        } catch (error) {
            console.error('Get activity error:', error);
            throw error;
        }
    },

    async updateActivity(activityId, activityData, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/activities/${activityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(activityData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update activity');
            return data;
        } catch (error) {
            console.error('Update activity error:', error);
            throw error;
        }
    },

    async cancelActivity(activityId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/activities/${activityId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Cancel activity error:', error);
            return { success: false, message: error.message };
        }
    }
};

export const SubscriptionService = {
    async getStatus(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/subscription/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return { isPro: false, subscriptionType: 'free' };
            return await response.json();
        } catch (error) {
            console.error('Get subscription status error:', error);
            return { isPro: false, subscriptionType: 'free' };
        }
    },

    async verify(productId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/subscription/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });
            return await response.json();
        } catch (error) {
            console.error('Verify subscription error:', error);
            return { success: false };
        }
    }
};

export const SOSService = {
    async activate(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/sos/activate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Activate SOS error:', error);
            return { success: false };
        }
    },

    async deactivate(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/sos/deactivate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Deactivate SOS error:', error);
            return { success: false };
        }
    },

    async getNearby(lat, lng) {
        try {
            const response = await fetch(`${BASE_URL}/api/sos/nearby?lat=${lat}&lng=${lng}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get nearby SOS error:', error);
            return [];
        }
    }
};

export const AssistService = {
    async create(data, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to create assist request');
            return result;
        } catch (error) {
            console.error('Create assist request error:', error);
            throw error;
        }
    },

    async list(status = null) {
        try {
            const url = status
                ? `${BASE_URL}/api/assist?status=${status}`
                : `${BASE_URL}/api/assist`;
            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('List assist requests error:', error);
            return [];
        }
    },

    async getDetail(id) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist/${id}`);
            if (!response.ok) throw new Error('Failed to fetch assist detail');
            return await response.json();
        } catch (error) {
            console.error('Get assist detail error:', error);
            throw error;
        }
    },

    async addMessage(id, content, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist/${id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to add message');
            return result;
        } catch (error) {
            console.error('Add assist message error:', error);
            throw error;
        }
    },

    async edit(id, data, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to edit request');
            return result;
        } catch (error) {
            console.error('Edit assist request error:', error);
            throw error;
        }
    },

    async delete(id, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete request');
            return result;
        } catch (error) {
            console.error('Delete assist request error:', error);
            throw error;
        }
    },

    async resolve(id, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/assist/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Resolve assist request error:', error);
            return { success: false };
        }
    }
};

export const BlockService = {
    async blockUser(userId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/blocks/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Block user error:', error);
            return { success: false };
        }
    },

    async unblockUser(userId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/blocks/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Unblock user error:', error);
            return { success: false };
        }
    },

    async getBlockedUsers(token) {
        try {
            const response = await fetch(`${BASE_URL}/api/blocks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Get blocked users error:', error);
            return [];
        }
    },

    async checkBlocked(userId, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/blocks/check/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return { isBlocked: false, isBlockedByThem: false };
            return await response.json();
        } catch (error) {
            console.error('Check blocked error:', error);
            return { isBlocked: false, isBlockedByThem: false };
        }
    }
};

export const AIService = {
    async chat(message, token) {
        try {
            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            if (response.status === 403 && data.requiresPro) {
                return { requiresPro: true };
            }
            if (!response.ok) throw new Error(data.error || 'AI request failed');
            return data;
        } catch (error) {
            console.error('AI chat error:', error);
            throw error;
        }
    }
};
