import client from './client';

export const getBalances = (householdId) => {
  return client.get(`/api/households/${householdId}/balances`);
};

export const getSummary = () => {
  return client.get('/api/households/balances/summary');
};
