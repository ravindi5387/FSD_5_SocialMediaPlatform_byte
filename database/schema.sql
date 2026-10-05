-- Connectly Task 5 database schema
-- Run this script in the NEW connectly-social-media Neon project.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio VARCHAR(280) NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(2000) NOT NULL,
  media_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('like', 'comment')),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  message VARCHAR(300) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);

-- Demo users. Password for all three: DemoPass123!
-- bcrypt hash generated specifically for the local/demo dataset.
INSERT INTO users (id, name, email, password_hash) VALUES
  (1, 'Ravindi Perera', 'ravindi.demo@connectly.app', '$2b$12$QrbCWbTxrACIRIRFNMTGK.3hI0sNgpG1TNf9nIebkF6Gm3gnj6OO2'),
  (2, 'Mayuri Silva', 'mayuri.demo@connectly.app', '$2b$12$QrbCWbTxrACIRIRFNMTGK.3hI0sNgpG1TNf9nIebkF6Gm3gnj6OO2'),
  (3, 'Suhitha Fernando', 'suhitha.demo@connectly.app', '$2b$12$QrbCWbTxrACIRIRFNMTGK.3hI0sNgpG1TNf9nIebkF6Gm3gnj6OO2')
ON CONFLICT (email) DO NOTHING;

SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1));

INSERT INTO profiles (user_id, bio, avatar_url) VALUES
  (1, 'Software engineering student building useful things with code.', ''),
  (2, 'Frontend developer • UI/UX enthusiast • coffee lover.', ''),
  (3, 'Backend developer • APIs • databases • clean architecture.', '')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO posts (id, user_id, content, media_url, created_at) VALUES
  (1, 2, 'Designing a cleaner feed experience today. Small details make a big difference ✨', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', NOW() - INTERVAL '2 hours'),
  (2, 3, 'Just finished improving the API validation and database layer. Feeling productive 🚀', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80', NOW() - INTERVAL '5 hours'),
  (3, 1, 'Welcome to Connectly — a simple place to share ideas, updates and conversations.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Refresh demo media links when the script is run again on an existing database.
UPDATE posts SET media_url = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80' WHERE id = 1 AND media_url = '';
UPDATE posts SET media_url = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80' WHERE id = 2 AND media_url = '';
UPDATE posts SET media_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80' WHERE id = 3 AND media_url = '';

SELECT setval(pg_get_serial_sequence('posts','id'), COALESCE((SELECT MAX(id) FROM posts), 1));

INSERT INTO likes (post_id, user_id) VALUES
  (1, 1), (1, 3), (2, 1), (3, 2)
ON CONFLICT DO NOTHING;

INSERT INTO comments (post_id, user_id, content) VALUES
  (1, 1, 'Looks great! The spacing feels much cleaner.'),
  (2, 2, 'Nice work — validation makes the API much safer.'),
  (3, 3, 'Welcome to Connectly! 🎉');

-- One example notification so the notification center is visible immediately.
INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
SELECT 1, 2, 'like', 3, 'Mayuri Silva liked your post.'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications WHERE recipient_id = 1 AND actor_id = 2 AND type = 'like' AND post_id = 3
);
