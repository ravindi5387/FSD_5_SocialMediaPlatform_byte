import { Edit3, Heart, Home, MessageCircle, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export function Sidebar({ onCompose }: { onCompose: () => void }) {
  const { user } = useAuth();
  return <aside className="sidebar">
    {user && <div className="profile-card"><Avatar name={user.name} size="lg" /><strong>{user.name}</strong><span>@{user.name.toLowerCase().replace(/\s+/g, '')}</span><Link to="/profile">View profile</Link></div>}
    <div className="side-nav">
      <Link to="/"><Home size={18} /> Home</Link>
      <Link to="/likes"><Heart size={18} /> Your likes</Link>
      <Link to="/profile"><UserCircle2 size={18} /> My profile</Link>
      <Link to="/comments"><MessageCircle size={18} /> Your comments</Link>
    </div>
    <button className="compose-side" onClick={onCompose}><Edit3 size={18} /> Create post</button>
  </aside>;
}
