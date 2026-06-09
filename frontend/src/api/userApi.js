import client from './client';

export const getProfile = () => {
  return client.get('/api/auth/profile');
};

export const updateProfile = (name, email) => {
  return client.put('/api/auth/profile', { name, email });
};

export const changePassword = (currentPassword, newPassword) => {
  return client.put('/api/auth/password', { currentPassword, newPassword });
};