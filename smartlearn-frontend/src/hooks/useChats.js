import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export function useChats() {
  const { user } = useAuth();
  
  return useQuery({
    // Isolate cache per user. If user logs out, user.id is undefined, cache resets.
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const res = await api.get(`${API}/chats`);
      const backendChats = res.data.chats;
      const metadata = res.data.metadata || {};
      
      if (!backendChats || Object.keys(backendChats).length === 0) {
        return [];
      }

      const formatted = Object.entries(backendChats).map(([chatId, messages]) => {
        const meta = metadata[chatId] || {};
        return {
          id: chatId,
          title: meta.title || messages[0]?.content?.slice(0, 30) || "Chat",
          is_pinned: meta.is_pinned || false,
          messages
        };
      });

      return formatted.sort((a, b) => {
        const getTime = (id) => {
          const parts = id.split('_');
          return Number(parts[parts.length - 1]) || 0;
        };
        return getTime(b.id) - getTime(a.id);
      });
    },
    // Prevent fetching if no user is logged in
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    cacheTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`${API}/chat/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['chats', user?.id], (oldChats) => {
        if (!oldChats) return [];
        return oldChats.filter(chat => chat.id !== id);
      });
    }
  });
}

export function useRenameChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, title }) => {
      await api.put(`${API}/chat/${id}/rename`, { title });
      return { id, title };
    },
    onSuccess: ({ id, title }) => {
      queryClient.setQueryData(['chats', user?.id], (oldChats) => {
        if (!oldChats) return [];
        return oldChats.map(chat => chat.id === id ? { ...chat, title } : chat);
      });
    }
  });
}

export function usePinChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, is_pinned }) => {
      await api.put(`${API}/chat/${id}/pin`, { is_pinned });
      return { id, is_pinned };
    },
    onSuccess: ({ id, is_pinned }) => {
      queryClient.setQueryData(['chats', user?.id], (oldChats) => {
        if (!oldChats) return [];
        return oldChats.map(chat => chat.id === id ? { ...chat, is_pinned } : chat);
      });
    }
  });
}

export function useChatHistory(chatId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['chatHistory', user?.id, chatId],
    queryFn: async () => {
      if (!chatId || chatId === "default") return { messages: [] };
      const res = await api.get(`${API}/chat/${chatId}/messages`);
      return res.data;
    },
    enabled: !!user && !!chatId && chatId !== "default",
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
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
