import api from './axios';

export const fetchTypes = async () => {
  const response = await api.get('/types');
  return response.data;
};
