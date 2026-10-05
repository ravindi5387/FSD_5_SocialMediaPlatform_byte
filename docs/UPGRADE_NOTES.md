# Connectly UI / Feature Upgrade Notes

### Authentication
- Registration now creates the account without signing the user in.
- After a successful registration, Connectly routes the user to `/login` and shows a success message.
- Login is the step that creates the JWT session.
- The supplied Connectly community artwork is used as the background for both login and registration states.

### Activity pages
- The Explore and Photos navigation items were removed.
- **Your likes** (`/likes`) shows posts the signed-in user has liked.
- **Your comments** (`/comments`) shows posts the signed-in user has commented on.
- The backend exposes protected `/api/posts/liked` and `/api/posts/commented` endpoints for these pages.

### Search
The top search bar now searches the home feed using the `/?search=...` route, so there is no separate Explore page.

### Media
`frontend/src/components/PostComposer.tsx` supports either a local image upload or an external image URL. Local images are converted to data URLs so the existing `posts.media_url` column can persist them without introducing another storage service.

### Post images
`frontend/src/components/PostCard.tsx` renders the media as a large post image, with lazy loading and a fallback media link if the remote image cannot be rendered.

### Share
`PostCard` uses `navigator.share()` where supported and falls back to the clipboard. The button changes to `Shared` after a successful operation.

### Notifications
`NotificationBell` refreshes while the page is visible and when the window receives focus. Likes and comments create database notifications in the backend.

### Dark / Light mode
`frontend/src/context/ThemeContext.tsx` stores the user's choice in `localStorage`. `ThemeToggle` is available on the authentication page and the main navigation. The dark palette now covers backgrounds, cards, form fields, composer, comments, media areas, notification panels, profile panels, and navigation controls consistently.

### Performance
The home feed avoids repeatedly fetching the profile after it has loaded. Activity pages use dedicated backend queries rather than fetching the whole feed and filtering in the browser. Navigation uses React Router for SPA transitions instead of full-page reloads.
