import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthState, type User } from '@/api/auth';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: authState, isLoading } = useQuery<AuthState>({
    queryKey: ['auth'],
    queryFn: authApi.getMe,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  const login = (redirectUrl?: string) => {
    window.location.href = authApi.getLoginUrl(redirectUrl);
  };

  const logout = async () => {
    await authApi.logout();
    queryClient.setQueryData(['auth'], { authenticated: false, user: null });
    queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
  };

  return {
    user: authState?.user || null,
    isAuthenticated: authState?.authenticated || false,
    isLoading,
    login,
    logout
  };
}
