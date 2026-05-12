import api from './axios';

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
};

export const updateUserState = async (userId: number, isActive: boolean) => {
  const response = await api.patch(`/users/${userId}/state`, { isActive });
  return response.data;
};

export const createAdminAccount = async (data: any) => {
  const response = await api.post('/users/admin', data);
  return response.data;
};

export const createModoAccount = async (data: any) => {
  const response = await api.post('/users/modo', data);
  return response.data;
};

export const favoriteResource = async (userId: number, resourceId: number) => {
  const response = await api.post(`/users/${userId}/favorites/${resourceId}`);
  return response.data;
};

export const unfavoriteResource = async (userId: number, resourceId: number) => {
  const response = await api.delete(`/users/${userId}/favorites/${resourceId}`);
  return response.data;
};

export const fetchMyFavorites = async () => {
  const response = await api.get('/users/favorites/me');
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await api.get(`/users/search?q=${query}`);
  return response.data;
};
