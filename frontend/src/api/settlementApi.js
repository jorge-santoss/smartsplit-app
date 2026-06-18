import client from './client';

export const create = (householdId, data) => {
  return client.post(`/api/households/${householdId}/settlements`, data);
};

export const listByHousehold = (householdId, page = 1, limit = 10) => {
  return client.get(`/api/households/${householdId}/settlements?page=${page}&limit=${limit}`);
};

export const remove = (settlementId) => {
  return client.delete(`/api/households/settlements/${settlementId}`);
};