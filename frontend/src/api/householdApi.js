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

export const update = (householdId, data) => {
  return client.put(`/api/households/${householdId}`, data);
};

export const removeMember = (householdId, userId) => {
  return client.delete(`/api/households/${householdId}/members/${userId}`);
};

export const remove = (householdId) => {
  return client.delete(`/api/households/${householdId}`);
};