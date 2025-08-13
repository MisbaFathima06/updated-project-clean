import { QueryClient } from '@tanstack/react-query';

// API request helper function
export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(`/api${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;

export const setupWebSocket = () => {
  try {
    const wsUrl = import.meta.env.PROD
      ? `wss://${window.location.host}/ws`
      : `ws://localhost:5000/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔌 WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message:', data);

      // Handle real-time updates
      if (data.type === 'complaint_update') {
        // Invalidate complaints query to refetch
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(setupWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  } catch (error) {
    console.error('Failed to setup WebSocket:', error);
  }
};