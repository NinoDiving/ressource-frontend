import api from './axios';

export const createConversation = async (data: { title?: string, participantIds: number[], resourceId?: number, message: string }) => {
  const response = await api.post('/conversations', data);
  return response.data;
};

export const fetchMyConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const fetchConversationById = async (id: number) => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const addMessageToConversation = async (id: number, text: string) => {
  const response = await api.post(`/conversations/${id}/messages`, { text });
  return response.data;
};
