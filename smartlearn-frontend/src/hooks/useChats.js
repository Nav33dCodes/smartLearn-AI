import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await axios.get(`${API}/chats`);
      const backendChats = res.data.chats;
      
      if (!backendChats || Object.keys(backendChats).length === 0) {
        return [];
      }

      const formatted = Object.entries(backendChats).map(([chatId, messages]) => ({
        id: chatId,
        title: messages[0]?.content?.slice(0, 30) || "Chat",
        messages
      }));

      return formatted.sort((a, b) => Number(b.id) - Number(a.id));
    }
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API}/chat/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['chats'], (oldChats) => {
        if (!oldChats) return [];
        return oldChats.filter(chat => chat.id !== id);
      });
    }
  });
}

export function useUploadPdf() {
  return useMutation({
    mutationFn: async ({ file, chatId }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/upload?chat_id=${chatId}`, formData);
      return res.data;
    }
  });
}
