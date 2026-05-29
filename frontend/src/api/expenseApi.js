import client from './client';

export const create = (householdId, data) => {
  return client.post(`/api/households/${householdId}/expenses`, data);
};

export const listByHousehold = (householdId) => {
  return client.get(`/api/households/${householdId}/expenses`);
};

export const getById = (expenseId) => {
  return client.get(`/api/households/expenses/${expenseId}`);
};  