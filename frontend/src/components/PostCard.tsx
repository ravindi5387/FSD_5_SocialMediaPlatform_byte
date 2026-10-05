import { Check, Heart, MessageCircle, MoreHorizontal, Send, Trash2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Comment, Post } from '../types';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';

function timeAgo(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function PostCard({ post, onRefresh }: { post: Post; onRefresh: () => void }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'done'>('idle');
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    setLiked(post.liked);
    setLikes(post.like_count);
    setCommentCount(post.comment_count);
    setMediaFailed(false);
  }, [post]);

  const toggleLike = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const r = await api.like(post.id);
      setLiked(r.liked);
      setLikes(r.like_count);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const loadComments = async () => {
    try {
      setComments(await api.comments(post.id));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const submitComment = async () => {
    const value = comment.trim();
    if (!value) return;
    try {
      await api.comment(post.id, value);
      setComment('');
      setCommentCount((c) => c + 1);
      await loadComments();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(post.id);
      onRefresh();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) await loadComments();
  };

  const share = async () => {
    const shareUrl = `${window.location.origin}/?post=${post.id}`;
    const payload = { title: `${post.author_name} on Connectly`, text: post.content, url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(`${post.content}\n${shareUrl}`);
      }
      setShareState('done');
      window.setTimeout(() => setShareState('idle'), 1600);
    } catch {
      try {
        await navigator.clipboard.writeText(`${post.content}\n${shareUrl}`);
        setShareState('done');
        window.setTimeout(() => setShareState('idle'), 1600);
      } catch {
        alert('Could not share this post.');
      }
    }
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <div className="post-author">
          <Avatar name={post.author_name} src={post.author_avatar} />
          <div>
            <strong>{post.author_name}</strong>
            <span>Public · {timeAgo(post.created_at)}</span>
          </div>
        </div>
        <div className="post-menu">
          {post.user_id === user?.id ? (
            <button className="icon-button subtle" title="Delete post" onClick={deletePost}>
              <Trash2 size={18} />
            </button>
          ) : (
            <button className="icon-button subtle" title="More options">
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
      </div>

      {post.content && <p className="post-content">{post.content}</p>}

      {post.media_url && (
        <div className={`post-media ${mediaFailed ? 'media-link-only' : ''}`}>
          {!mediaFailed ? (
            <img
              src={post.media_url}
              alt={`${post.author_name}'s post media`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setMediaFailed(true)}
            />
          ) : (
            <a href={post.media_url} target="_blank" rel="noreferrer" className="post-media-fallback">
              <ExternalLink size={16} />
              Open media attachment
            </a>
          )}
        </div>
      )}

      <div className="post-meta">
        <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
        <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      <div className="post-actions">
        <button className={`post-action like-action ${liked ? 'liked' : ''}`} onClick={toggleLike} disabled={saving}>
          <Heart size={19} fill={liked ? 'currentColor' : 'none'} />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>
        <button className="post-action" onClick={toggleComments}>
          <MessageCircle size={19} /> Comment
        </button>
        <button className="post-action share-action" onClick={share}>
          {shareState === 'done' ? <Check size={18} /> : <Send size={18} />}
          {shareState === 'done' ? 'Shared' : 'Share'}
        </button>
      </div>

      {showComments && (
        <div className="comments-box">
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="muted">No comments yet. Start the conversation.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="comment">
                  <Avatar name={c.author_name} src={c.author_avatar} size="sm" />
                  <div className="comment-bubble">
                    <strong>{c.author_name}</strong>
                    <p>{c.content}</p>
                    <time>{timeAgo(c.created_at)}</time>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="comment-composer">
            <Avatar name={user?.name || 'You'} size="sm" />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submitComment();
              }}
              placeholder="Write a comment..."
              maxLength={500}
            />
            <button onClick={submitComment} disabled={!comment.trim()} aria-label="Post comment">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
