import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Post, Profile } from '../types';

export function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const postsPromise = api.posts(search);
      const profilePromise = profile ? Promise.resolve(profile) : api.profile();
      const [p, me] = await Promise.all([postsPromise, profilePromise]);
      setPosts(p); setProfile(me);
    } finally { setLoading(false); }
  }, [search, user]);

  useEffect(() => { setSearch(params.get('search') || ''); }, [params]);
  useEffect(() => { void load(); }, [load]);
  if (!user) return null;
  return <div className="app-shell"><NavBar onSearch={setSearch} /><div className="app-grid"><Sidebar onCompose={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })} /><main className="feed-main"><div className="feed-hero"><div><span className="eyebrow">WELCOME BACK, {user.name.split(' ')[0].toUpperCase()}</span><h1>Your social feed</h1><p>Catch up with the latest from your Connectly community.</p></div><div className="hero-chip"><Sparkles size={18} /> {posts.length} posts</div></div><div id="composer"><PostComposer user={user} onCreated={load} /></div><div className="feed-heading"><h2>{search ? `Results for “${search}”` : 'Latest posts'}</h2><span>{loading ? 'Refreshing…' : 'Sorted by newest'}</span></div>{loading ? <div className="loading-card">Loading your feed…</div> : posts.length === 0 ? <div className="empty-feed"><UsersRound size={32} /><h3>No posts found</h3><p>Try another search term or start the conversation.</p><button className="publish-button" onClick={() => { setSearch(''); setParams({}); }}><Sparkles size={16} /> Clear search</button></div> : posts.map(post => <PostCard key={post.id} post={post} onRefresh={load} />)}</main><aside className="rightbar"><div className="side-widget"><h3>Complete your profile</h3><div className="profile-progress"><div className="profile-widget-row"><Avatar name={user.name} src={profile?.avatar_url} size="md" /><div><strong>{user.name}</strong><span>{profile?.bio || 'Tell people a little about yourself.'}</span></div></div><Link className="widget-action" to="/profile">Edit profile</Link></div></div><div className="side-widget"><h3>Why Connectly?</h3><p className="widget-copy">A polished social platform built with secure authentication, persistent posts, interactions and notification alerts.</p><div className="widget-tags"><span>Secure</span><span>Fast</span><span>Responsive</span><span>Dark / Light</span></div></div></aside></div></div>;
}
