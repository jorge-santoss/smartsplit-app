import client from './client';

export const create = (householdId, data) => {
  return client.post(`/api/households/${householdId}/settlements`, data);
};

export const listByHousehold = (householdId) => {
  return client.get(`/api/households/${householdId}/settlements`);
};

export const remove = (settlementId) => {
  return client.delete(`/api/households/settlements/${settlementId}`);
};