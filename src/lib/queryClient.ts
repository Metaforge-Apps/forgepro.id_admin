import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack QueryClient Instance (Fase 0: 0.2)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 detik
      gcTime: 1000 * 60 * 10, // 10 menit
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
