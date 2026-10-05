export interface User { id: number; name: string; email: string; }
export interface Profile extends User { bio: string; avatar_url: string; post_count: number; }
export interface Post {
  id: number; user_id: number; content: string; media_url: string; created_at: string;
  author_name: string; author_avatar: string; liked: boolean; like_count: number; comment_count: number;
}
export interface Comment {
  id: number; post_id: number; user_id: number; content: string; created_at: string;
  author_name: string; author_avatar: string;
}
export interface Notification {
  id: number; type: 'like' | 'comment'; post_id: number | null; message: string;
  is_read: boolean; created_at: string; actor_id: number; actor_name: string; post_content?: string;
}
