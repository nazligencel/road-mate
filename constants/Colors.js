const DarkColors = {
    background: '#0B131A',
    card: '#1C2B34',
    cardGlass: 'rgba(28, 43, 52, 0.6)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    primary: '#3893A0',
    secondary: '#C5A059',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    accent: '#A5C1C9',
    border: '#24343E',
    error: '#EF4444',
    success: '#10B981',
    online: '#4FDBB1',
    overlay: 'rgba(11, 19, 26, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassBackground: 'rgba(255, 255, 255, 0.05)',
};

const LightColors = {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardGlass: 'rgba(255, 255, 255, 0.8)',
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    primary: '#3893A0',
    secondary: '#C5A059',
    text: '#1E293B',
    textSecondary: '#64748B',
    accent: '#A5C1C9',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
    online: '#4FDBB1',
    overlay: 'rgba(248, 250, 252, 0.8)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
    glassBackground: 'rgba(0, 0, 0, 0.03)',
};

export const getColors = (isDarkMode) => isDarkMode ? DarkColors : LightColors;

// Default export for backward compatibility (dark mode)
export const Colors = DarkColors;
