import client from './client';

export const create = (name, description) => {
  return client.post('/api/households', { name, description });
};

export const list = () => {
  return client.get('/api/households');
};

export const getById = (id) => {
  return client.get(`/api/households/${id}`);
};

export const addMember = (householdId, email, role) => {
  return client.post(`/api/households/${householdId}/members`, { email, role });
};