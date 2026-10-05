import { Home, LogOut, Search, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { Brand } from './Brand';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';

export function NavBar({ onSearch }: { onSearch?: (value: string) => void }) {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    navigate(value ? `/?search=${encodeURIComponent(value)}` : '/');
    onSearch?.(value);
  };
  return <header className="topbar">
    <div className="topbar-inner">
      <Link to="/" className="brand-link"><Brand /></Link>
      <form className="search-box" onSubmit={submit}>
        <Search size={18} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people, posts, topics" aria-label="Search Connectly" />
      </form>
      <nav className="top-actions">
        <Link className="nav-link" to="/"><Home size={19} /><span>Home</span></Link>
        <Link className="nav-link" to="/profile"><UserRound size={19} /><span>Profile</span></Link>
        <NotificationBell />
        <ThemeToggle />
        {user && <div className="user-mini"><Avatar name={user.name} size="sm" /><span>{user.name.split(' ')[0]}</span></div>}
        <button className="icon-button logout-btn" title="Log out" onClick={logout}><LogOut size={18} /></button>
      </nav>
    </div>
  </header>;
}
