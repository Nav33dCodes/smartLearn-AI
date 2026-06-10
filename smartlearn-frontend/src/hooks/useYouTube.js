import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useYouTubeRecommendations = (query, enabled = false) => {
  return useQuery({
    queryKey: ['youtube', query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.post('/api/youtube', { query });
      return data.videos || [];
    },
    enabled: !!query && enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
