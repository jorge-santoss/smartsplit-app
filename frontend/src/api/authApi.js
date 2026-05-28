import client from './client';

export const register = (name, email, password) => {
  return client.post('/api/auth/register', { name, email, password });
};

export const login = (email, password) => {
  return client.post('/api/auth/login', { email, password });
};