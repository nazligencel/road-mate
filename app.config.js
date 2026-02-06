import 'dotenv/config';

export default {
    expo: {
        name: "road-mate",
        slug: "road-mate",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.nazligencel.roadmate",
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY
            },
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "Uygulama, yakındaki nomadları görebilmeniz için konumunuza ihtiyaç duyar."
            }
        },
        android: {
            package: "com.nazligencel.roadmate",
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY
                }
            },
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION"
            ],
            edgeToEdgeEnabled: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        scheme: "road-mate",
        extra: {
            eas: {
                projectId: "d50310df-3620-497f-b72e-6aa5ef455a99"
            }
        },
        plugins: [
            "expo-router",
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "Allow Road Mate to access your location to find nearby nomads."
                }
            ],
            "@react-native-google-signin/google-signin",
            [
                "expo-image-picker",
                {
                    photosPermission: "Allow Road Mate to access your photos to set profile picture."
                }
            ]
        ]
    }
};
