export const userSeemsAuthenticated = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie.includes('active=');
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

export const isAccountVerified = (user) => {
  const verified = user?.verified;
  return verified === true || verified === 1 || verified === '1';
};
