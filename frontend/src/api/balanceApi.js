import client from './client';

export const getSummary = () => {
  return client.get('/api/balances/summary');
};

export const getBalances = (householdId) => {
  return client.get(`/api/households/${householdId}/balances`);
};