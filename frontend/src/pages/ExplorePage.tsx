import { Compass, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { NavBar } from '../components/NavBar';
import { PostCard } from '../components/PostCard';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

export function ExplorePage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get('search') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const photosOnly = params.get('media') === '1';

  const load = async (value: string) => {
    setLoading(true);
    try {
      const result = await api.posts(value);
      setPosts(photosOnly ? result.filter((post) => Boolean(post.media_url)) : result);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const value = params.get('search') || '';
    setQuery(value);
    const timer = window.setTimeout(() => { void load(value); }, 250);
    return () => window.clearTimeout(timer);
  }, [params.toString()]);

  const refresh = () => { void load(query.trim()); };
  const submitSearch = () => {
    const next = new URLSearchParams(params);
    if (query.trim()) next.set('search', query.trim()); else next.delete('search');
    setParams(next);
  };

  if (!user) return null;
  return <div className="app-shell"><NavBar /><div className="app-grid"><Sidebar onCompose={() => navigate('/')} /><main className="feed-main">
    <div className="explore-hero">
      <div><span className="eyebrow">DISCOVER CONNECTLY</span><h1><Compass size={30} /> Explore</h1><p>Find posts, ideas and community conversations beyond your home feed.</p></div>
      <div className="hero-chip"><Sparkles size={17} /> {posts.length} results</div>
    </div>
    <div className="explore-search-row"><div className="search-box explore-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitSearch(); } }} placeholder="Search posts or people" /><button onClick={submitSearch}>Search</button></div>
      <button className={`filter-chip ${photosOnly ? 'active' : ''}`} onClick={() => setParams(photosOnly ? {} : { media: '1' })}><Avatar name="P" size="sm" /> {photosOnly ? 'All posts' : 'Photos only'}</button>
    </div>
    <div className="feed-heading"><h2>{photosOnly ? 'Photo posts' : query ? `Results for “${query}”` : 'Discover latest posts'}</h2><span>{loading ? 'Searching…' : 'Updated just now'}</span></div>
    {loading ? <div className="loading-card">Finding fresh posts…</div> : posts.length === 0 ? <div className="empty-feed"><Compass size={34} /><h3>No results yet</h3><p>Try another keyword or switch back to all posts.</p></div> : posts.map(post => <PostCard key={post.id} post={post} onRefresh={refresh} />)}
  </main></div></div>;
}
