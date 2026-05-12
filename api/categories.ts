import api from './axios';

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const addCategory = async (data: { name: string }) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const editCategory = async (id: number, data: { name: string }) => {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
