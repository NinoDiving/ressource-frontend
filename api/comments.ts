import api from './axios';

export const fetchAllComments = async () => {
  const response = await api.get('/comments');
  return response.data;
};

export const fetchCommentsByResource = async (resourceId: number) => {
  const response = await api.get(`/comments/resource/${resourceId}`);
  return response.data;
};

export const createComment = async (data: { content: string, resourceId: number, parentId?: number }) => {
  const response = await api.post('/comments', data);
  return response.data;
};

export const updateCommentState = async (id: number, isSuspended: boolean) => {
  const response = await api.patch(`/comments/${id}/state`, { isSuspended });
  return response.data;
};

export const deleteComment = async (id: number) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
