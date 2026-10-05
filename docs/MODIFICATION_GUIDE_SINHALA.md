# Connectly Task 5 — Modification Guide

## 1. Registration → Login

File: `frontend/src/context/AuthContext.tsx`

Registration should not create an active session. Replace the register implementation with:

```tsx
async register(name, email, password) {
  await api.register({ name, email, password });
  localStorage.removeItem('connectly_token');
  setUser(null);
}
```

File: `frontend/src/pages/AuthPage.tsx`

After successful registration:

```tsx
await register(name, email, password);
navigate('/login', {
  replace: true,
  state: { message: 'Account created successfully. Please sign in to continue.' }
});
```

## 2. Remove Explore and Photos

File: `frontend/src/components/Sidebar.tsx`

Replace Explore/Photos links with:

```tsx
<Link to="/likes"><Heart size={18} /> Your likes</Link>
<Link to="/comments"><MessageCircle size={18} /> Your comments</Link>
```

File: `frontend/src/App.tsx`

Use:

```tsx
<Route path="/likes" element={<Protected><ActivityPage mode="likes" /></Protected>} />
<Route path="/comments" element={<Protected><ActivityPage mode="comments" /></Protected>} />
```

The old `ExplorePage.tsx` is removed.

## 3. Your Likes / Your Comments backend

File: `backend/src/controllers/postController.ts`

The two new protected queries use the existing feed query and filter with `EXISTS`:

```sql
WHERE EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1)
```

and:

```sql
WHERE EXISTS (SELECT 1 FROM comments c WHERE c.post_id = p.id AND c.user_id = $1)
```

File: `backend/src/routes/postRoutes.ts`

```tsx
postRoutes.get('/liked', listLikedPosts);
postRoutes.get('/commented', listCommentedPosts);
```

## 4. Search without Explore

File: `frontend/src/components/NavBar.tsx`

Search now navigates to the home feed:

```tsx
navigate(value ? `/?search=${encodeURIComponent(value)}` : '/');
```

`HomePage.tsx` reads the `search` query parameter and loads matching posts.

## 5. Login / Register background

Asset:

```text
frontend/public/connectly-auth-bg.png
```

File: `frontend/src/styles.css`

```css
.auth-photo {
  background: url('/connectly-auth-bg.png') center/cover no-repeat;
}
```

The same AuthPage is used for both `/login` and `/register`, so both states use the supplied Connectly background artwork.

## 6. Dark mode

File: `frontend/src/context/ThemeContext.tsx`

The user's selection is stored in `localStorage`.

File: `frontend/src/styles.css`

The `[data-theme="dark"]` rules now cover cards, navigation, inputs, textarea, comments, media areas, notification panels, profile sections and other surfaces with a consistent navy/slate palette.

## 7. Post images

File: `frontend/src/components/PostCard.tsx`

`media_url` is rendered as an in-post `<img>` with a fallback link when the URL cannot be previewed.

File: `frontend/src/components/PostComposer.tsx`

Users can choose either a local image upload or an image URL.
