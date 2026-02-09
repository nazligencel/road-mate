const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
};

export const isValidPassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
};

export const isNotEmpty = (value) => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length > 0;
};

export const isMaxLength = (value, max) => {
    if (!value || typeof value !== 'string') return true;
    return value.length <= max;
};
