import type { Comment, Notification, Post, Profile, User } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('connectly_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data as T;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) => request<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) => request<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<{ user: User }>('/auth/me'),
  profile: () => request<Profile>('/profile/me'),
  updateProfile: (payload: { bio: string; avatar_url: string }) => request('/profile/me', { method: 'PUT', body: JSON.stringify(payload) }),
  posts: (search = '') => request<Post[]>(`/posts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  likedPosts: () => request<Post[]>('/posts/liked'),
  commentedPosts: () => request<Post[]>('/posts/commented'),
  createPost: (payload: { content: string; media_url?: string }) => request<Post>('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  deletePost: (postId: number) => request(`/posts/${postId}`, { method: 'DELETE' }),
  like: (postId: number) => request<{ liked: boolean; like_count: number }>(`/posts/${postId}/like`, { method: 'POST' }),
  comments: (postId: number) => request<Comment[]>(`/posts/${postId}/comments`),
  comment: (postId: number, content: string) => request<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  notifications: () => request<{ items: Notification[]; unread: number }>('/notifications'),
  markRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' })
};
