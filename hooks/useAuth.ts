'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, register as registerApi, fetchMe, logout as logoutApi } from '@/api/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      router.push('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      router.push('/');
    },
  });

  const logout = () => {
    logoutApi();
    queryClient.setQueryData(['me'], null);
    router.push('/login');
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
