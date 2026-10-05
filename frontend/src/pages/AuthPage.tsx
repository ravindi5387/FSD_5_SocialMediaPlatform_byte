import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState((location.state as { message?: string } | null)?.message || '');
  const { login, register, user } = useAuth(); const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
      return;
    }
    const pathMode = location.pathname === '/register' ? 'register' : 'login';
    if (pathMode !== mode) setMode(pathMode);
    const message = (location.state as { message?: string } | null)?.message || '';
    if (message) setNotice(message);
  }, [user, navigate, location.pathname, location.state, mode]);
  const submit = async () => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
        navigate('/login', { replace: true, state: { message: 'Account created successfully. Please sign in to continue.' } });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return <main className="auth-page">
    <div className="auth-photo" />
    <div className="auth-shade" />
    <div className="auth-top"><Link to="/" className="auth-brand"><img src="/connectly-icon.png" alt="Connectly" /><div><strong>Connectly</strong><span>Share. Connect. Inspire.</span></div></Link><div className="auth-top-actions"><span className="auth-pill"><Sparkles size={14} /> A modern social space</span><ThemeToggle /></div></div>
    <div className="auth-layout">
      <section className="auth-story"><span className="eyebrow">YOUR PEOPLE. YOUR SPACE.</span><h1>Stay close to the people and ideas that matter.</h1><p>Share moments, discover conversations, and build a community that feels like yours.</p><div className="story-points"><span>✓ Secure, protected accounts</span><span>✓ Fast interaction alerts</span><span>✓ Photos, posts & comments</span></div></section>
      <section className="auth-card">
        <div className="auth-card-brand"><img src="/connectly-icon.png" alt="Connectly" /><span>Connectly</span></div>
        <div className="auth-card-head"><span className="eyebrow">WELCOME TO CONNECTLY</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to continue to your social workspace.' : 'Join the conversation and start sharing.'}</p></div>
        {notice && <div className="form-notice">{notice}</div>}
        {error && <div className="form-alert">{error}</div>}
        {mode === 'register' && <label><span>Full name</span><div className="input-wrap"><UserRound size={18} /><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div></label>}
        <label><span>Email address</span><div className="input-wrap"><Mail size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div></label>
        <label><span>Password</span><div className="input-wrap"><LockKeyhole size={18} /><input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /><button type="button" onClick={() => setShow(v => !v)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        <button className="auth-submit" onClick={submit} disabled={busy || !email || !password || (mode === 'register' && !name.trim())}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <p className="auth-switch">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button onClick={() => { setError(''); setNotice(''); navigate(mode === 'login' ? '/register' : '/login'); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        <div className="auth-demo">Demo accounts are available in the README for local testing.</div>
      </section>
    </div>
    <div className="auth-footer">AVIP 2026 · Task 5 · Social Media Platform · Connectly</div>
  </main>;
}
