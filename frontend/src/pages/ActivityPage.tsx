import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Post } from '../types';

type ActivityMode = 'likes' | 'comments';

export function ActivityPage({ mode }: { mode: ActivityMode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setPosts(mode === 'likes' ? await api.likedPosts() : await api.commentedPosts());
    } finally {
      setLoading(false);
    }
  }, [mode, user]);

  useEffect(() => { void load(); }, [load]);
  if (!user) return null;

  const isLikes = mode === 'likes';
  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-grid">
        <Sidebar onCompose={() => navigate('/')} />
        <main className="feed-main activity-main">
          <div className="activity-hero">
            <div>
              <span className="eyebrow">YOUR CONNECTLY ACTIVITY</span>
              <h1>{isLikes ? <><Heart size={28} /> Your likes</> : <><MessageCircle size={28} /> Your comments</>}</h1>
              <p>{isLikes ? 'Revisit the posts you have liked across your community.' : 'Keep track of the conversations you have joined.'}</p>
            </div>
            <div className="hero-chip"><Sparkles size={17} /> {posts.length} posts</div>
          </div>
          <div className="feed-heading"><h2>{isLikes ? 'Posts you liked' : 'Posts you commented on'}</h2><span>{loading ? 'Updating…' : 'Saved activity'}</span></div>
          {loading ? (
            <div className="loading-card">Loading your activity…</div>
          ) : posts.length === 0 ? (
            <div className="empty-feed">
              {isLikes ? <Heart size={34} /> : <MessageCircle size={34} />}
              <h3>{isLikes ? 'No liked posts yet' : 'No comments yet'}</h3>
              <p>{isLikes ? 'Like a post from your home feed and it will appear here.' : 'Join a conversation from the home feed and your commented posts will appear here.'}</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onRefresh={load} />)
          )}
        </main>
      </div>
    </div>
  );
}
