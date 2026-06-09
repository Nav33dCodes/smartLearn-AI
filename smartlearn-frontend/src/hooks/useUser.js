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

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ current_password, new_password }) => {
      const res = await api.put(`${API}/auth/user/password`, { current_password, new_password });
      return res.data;
    }
  });
}
