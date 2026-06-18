import client from './client';

export const create = (householdId, data) => {
  return client.post(`/api/households/${householdId}/expenses`, data);
};

export const listByHousehold = (householdId, page = 1, limit = 10) => {
  return client.get(`/api/households/${householdId}/expenses?page=${page}&limit=${limit}`);
};

export const getById = (expenseId) => {
  return client.get(`/api/households/expenses/${expenseId}`);
};

export const update = (expenseId, data) => {
  return client.put(`/api/households/expenses/${expenseId}`, data);
};

export const remove = (expenseId) => {
  return client.delete(`/api/households/expenses/${expenseId}`);
};