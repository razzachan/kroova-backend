import axios from 'axios';
import { supabase } from './supabase';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
  baseURL: apiUrl ? `${apiUrl}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
