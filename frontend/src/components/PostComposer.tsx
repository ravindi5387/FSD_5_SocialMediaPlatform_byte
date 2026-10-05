import { ImagePlus, Link2, Send, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { Avatar } from './Avatar';

const MAX_IMAGE_BYTES = 2_500_000;

export function PostComposer({ user, onCreated, compact = false }: { user: User; onCreated: () => void; compact?: boolean }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState('');
  const [openMedia, setOpenMedia] = useState(false);
  const [mediaMode, setMediaMode] = useState<'upload' | 'url'>('upload');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [urlPreviewFailed, setUrlPreviewFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const chooseFile = (file: File) => {
    if (!file.type.startsWith('image/')) return alert('Please choose an image file.');
    if (file.size > MAX_IMAGE_BYTES) return alert('Please choose an image smaller than 2.5 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      setMedia(String(reader.result || ''));
      setFileName(file.name);
      setMediaMode('upload');
      setOpenMedia(true);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => { setMedia(''); setFileName(''); setUrlPreviewFailed(false); if (fileRef.current) fileRef.current.value = ''; };

  const submit = async () => {
    if (!content.trim() && !media.trim()) return;
    setBusy(true);
    try {
      await api.createPost({ content: content.trim() || 'Shared an image.', media_url: media.trim() });
      setContent(''); clearMedia(); setOpenMedia(false); onCreated();
    } catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };

  return <section className={`composer ${compact ? 'composer-compact' : ''}`}>
    <div className="composer-row"><Avatar name={user.name} size="md" /><textarea value={content} onChange={e => setContent(e.target.value)} placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`} maxLength={2000} rows={compact ? 2 : 3} /></div>
    <input ref={fileRef} className="file-input-hidden" type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) chooseFile(file); }} />
    {openMedia && <div className="media-editor">
      <div className="media-tabs"><button className={mediaMode === 'upload' ? 'active' : ''} onClick={() => setMediaMode('upload')}><Upload size={15} /> Upload image</button><button className={mediaMode === 'url' ? 'active' : ''} onClick={() => setMediaMode('url')}><Link2 size={15} /> Image URL</button></div>
      {mediaMode === 'upload' ? <div className="upload-row"><button className="secondary-button" onClick={() => fileRef.current?.click()}><ImagePlus size={17} /> Choose image</button><span>{fileName || 'PNG, JPG or WEBP · max 2.5 MB'}</span></div> : <div className="media-input-row"><input value={media.startsWith('data:') ? '' : media} onChange={e => { setMedia(e.target.value); setFileName(''); setUrlPreviewFailed(false); }} placeholder="https://example.com/photo.jpg" /><button onClick={clearMedia} title="Clear media"><X size={16} /></button></div>}
      {media && <div className="media-preview">{!urlPreviewFailed ? <img src={media} alt="Selected post preview" referrerPolicy="no-referrer" onError={() => setUrlPreviewFailed(true)} /> : <div className="media-url-invalid">This link could not be previewed as an image. Use a direct image URL or upload a file.</div>}<button onClick={clearMedia} aria-label="Remove selected image"><X size={16} /></button></div>}
    </div>}
    <div className="composer-footer"><button className="composer-option" onClick={() => setOpenMedia(v => !v)}><ImagePlus size={19} /> {openMedia ? 'Media options' : 'Add photo / media'}</button><button className="publish-button" onClick={submit} disabled={busy || (!content.trim() && !media.trim())}>{busy ? 'Publishing...' : <>Publish <Send size={16} /></>}</button></div>
  </section>;
}
