/**
 * React Query Provider
 * Configures global settings for data fetching and caching
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache garbage collection after 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: Boolean(false), // Don't refetch when app comes back to foreground
      refetchOnReconnect: Boolean(true), // Refetch when internet reconnects
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
