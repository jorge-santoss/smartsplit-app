import client from './client';

export const getFeed = (page = 1, limit = 20) => {
  return client.get(`/api/feed?page=${page}&limit=${limit}`);
};