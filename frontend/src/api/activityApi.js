import client from './client';

export const getFeed = () => {
  return client.get('/api/feed');
};
