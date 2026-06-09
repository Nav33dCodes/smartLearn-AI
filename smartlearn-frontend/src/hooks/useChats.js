import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        const res = await api.get(`${API}/chats`);
        const backendChats = res.data.chats;
        const metadata = res.data.metadata || {};
        
        if (!backendChats || Object.keys(backendChats).length === 0) {
          localStorage.setItem('cached_chats', JSON.stringify([]));
          return [];
        }

        const formatted = Object.entries(backendChats).map(([chatId, messages]) => {
          const rawId = chatId.split("_").pop(); // optional fallback cleanup if needed
          return {
            id: chatId,
            title: metadata[chatId] || messages[0]?.content?.slice(0, 30) || "Chat",
            messages
          };
        });

        const sorted = formatted.sort((a, b) => Number(b.id) - Number(a.id));
        localStorage.setItem('cached_chats', JSON.stringify(sorted));
        return sorted;
      } catch (error) {
        const cached = localStorage.getItem('cached_chats');
        if (cached) return JSON.parse(cached);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    cacheTime: 1000 * 60 * 30, // 30 minutes garbage collection
    initialData: () => {
      const cached = localStorage.getItem('cached_chats');
      return cached ? JSON.parse(cached) : undefined;
    }
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`${API}/chat/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['chats'], (oldChats) => {
        if (!oldChats) return [];
        const newChats = oldChats.filter(chat => chat.id !== id);
        localStorage.setItem('cached_chats', JSON.stringify(newChats));
        return newChats;
      });
    }
  });
}

export function useRenameChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, title }) => {
      await api.put(`${API}/chat/${id}/rename`, { title });
      return { id, title };
    },
    onSuccess: ({ id, title }) => {
      queryClient.setQueryData(['chats'], (oldChats) => {
        if (!oldChats) return [];
        const newChats = oldChats.map(chat => chat.id === id ? { ...chat, title } : chat);
        localStorage.setItem('cached_chats', JSON.stringify(newChats));
        return newChats;
      });
    }
  });
}

export function useUploadPdf() {
  return useMutation({
    mutationFn: async ({ file, chatId }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`${API}/upload?chat_id=${chatId}`, formData);
      return res.data;
    }
  });
}
