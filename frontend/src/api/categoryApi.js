import client from './client';

export const listByHousehold = (householdId) => {
  return client.get(`/api/households/${householdId}/categories`);
};

export const create = (householdId, name) => {
  return client.post(`/api/households/${householdId}/categories`, { name });
};
