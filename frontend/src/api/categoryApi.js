import client from './client';

export const listByHousehold = (householdId) => {
  return client.get(`/api/households/${householdId}/categories`);
};

export const create = (householdId, name) => {
  return client.post(`/api/households/${householdId}/categories`, { name });
};

export const update = (categoryId, name) => {
  return client.put(`/api/households/categories/${categoryId}`, { name });
};

export const remove = (categoryId) => {
  return client.delete(`/api/households/categories/${categoryId}`);
};