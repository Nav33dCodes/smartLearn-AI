import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.DEV ? "http://localhost:8000" : "https://smartlearn-ai-production.up.railway.app";

export function useUpdateName() {
  const { user, login } = useAuth();
  
  return useMutation({
    mutationFn: async ({ name }) => {
      const res = await api.put(`${API}/auth/user/name`, { name });
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Update local storage user object
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      login({ ...user, name: variables.name }, token, refreshToken);
    }
  });
}

export function useUpdateAvatar() {
  const { user, login } = useAuth();
  
  return useMutation({
    mutationFn: async ({ avatar }) => {
      const res = await api.put(`${API}/auth/user/avatar`, { avatar });
      return res.data;
    },
    onSuccess: (data, variables) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      login({ ...user, avatar: variables.avatar }, token, refreshToken);
    }
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ current_password, new_password }) => {
      const res = await api.put(`${API}/auth/user/password`, { current_password, new_password });
      return res.data;
    }
  });
}

export function useDeleteAllChats() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`${API}/auth/user/chats`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chats', user?.id]);
    }
  });
}

export function useRequestDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`${API}/auth/user/delete-request`);
      return res.data;
    }
  });
}

export function useConfirmDeleteAccount() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: async ({ otp }) => {
      const res = await api.delete(`${API}/auth/user/account`, { data: { otp } });
      return res.data;
    },
    onSuccess: () => {
      logout();
    }
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get(`${API}/auth/user/export`);
      return res.data;
    }
  });
}
