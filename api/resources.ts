import api from './axios';

export const createResource = async (data: any) => {
  const response = await api.post('/resources', data);
  return response.data;
};

export const fetchResources = async (params?: any) => {
  const response = await api.get('/resources', { params });
  return response.data;
};

export const fetchMyResources = async () => {
  const response = await api.get('/resources/me');
  return response.data;
};

export const updateResourceState = async (id: number, state: 'Draft' | 'Publish') => {
  const response = await api.patch(`/resources/${id}/state`, { state });
  return response.data;
};

export const updateOwnResourceState = async (id: number, state: 'Draft' | 'Publish') => {
  if (state === 'Publish') {
    const response = await api.patch(`/resources/${id}/validate-request`);
    return response.data;
  } else {
    // Return to draft state
    const response = await api.patch(`/resources/${id}`, { isDrafted: true, isSuspended: true });
    return response.data;
  }
};

export const deleteResource = async (id: number) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

export const deleteOwnResource = async (id: number) => {
  const response = await api.delete(`/resources/${id}/own`);
  return response.data;
};

export const fetchPendingResources = async () => {
  const response = await api.get('/resources/pending');
  return response.data;
};

export const validateResource = async (id: number) => {
  const response = await api.patch(`/resources/${id}/validate`);
  return response.data;
};

export const fetchResourceById = async (id: number) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

export const updateResource = async (id: number, data: any) => {
  const response = await api.patch(`/resources/${id}`, data);
  return response.data;
};
