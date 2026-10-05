import { Camera, Edit3, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Profile } from '../types';

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null); const [editing, setEditing] = useState(false); const [bio, setBio] = useState(''); const [avatar, setAvatar] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { if (!user) return; const p = await api.profile(); setProfile(p); setBio(p.bio || ''); setAvatar(p.avatar_url || ''); };
  useEffect(() => { void load(); }, [user]);
  if (!user) return null;
  const save = async () => { setBusy(true); try { await api.updateProfile({ bio, avatar_url: avatar }); await load(); setEditing(false); } catch (e) { alert((e as Error).message); } finally { setBusy(false); } };
  return <div className="app-shell"><NavBar onSearch={() => {}} /><div className="app-grid"><Sidebar onCompose={() => {}} /><main className="profile-main"><div className="profile-cover"><div className="profile-cover-content"><div className="profile-avatar-xl"><Avatar name={user.name} src={avatar || undefined} size="lg" /></div><div><span className="eyebrow">CONNECTLY MEMBER</span><h1>{user.name}</h1><p>{user.email}</p></div></div></div><section className="profile-panel"><div className="profile-toolbar"><div><h2>About you</h2><p>Keep your profile fresh so people know who they are connecting with.</p></div>{editing ? <button className="publish-button" onClick={save} disabled={busy}><Save size={16} /> {busy ? 'Saving...' : 'Save changes'}</button> : <button className="secondary-button" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit profile</button>}</div>{editing ? <div className="profile-form"><label>Profile photo URL<div className="input-wrap"><Camera size={18} /><input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg" /></div></label><label>Bio<textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={280} rows={4} placeholder="Tell the community about yourself..." /></label></div> : <div className="profile-details"><div className="detail-card"><UserRound size={20} /><span>Bio</span><strong>{profile?.bio || 'Add a short introduction.'}</strong></div><div className="detail-card"><span>Posts</span><strong>{profile?.post_count ?? 0}</strong><small>Published posts</small></div></div>}</section></main></div></div>;
}
