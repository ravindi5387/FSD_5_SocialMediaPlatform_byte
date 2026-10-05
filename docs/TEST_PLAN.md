# Connectly — Task 5 Test Plan

1. Register a new user. Expect HTTP 201 and JWT.
2. Login with the new account. Expect HTTP 200 and JWT.
3. Open `/api/auth/me` with the JWT. Expect current user only when authenticated.
4. Open the feed. Posts should be ordered newest first.
5. Create a text post. Confirm it appears at the top of the feed.
6. Create a post with a media URL. Confirm the media reference is stored and shown.
7. Like another user's post. Confirm the heart is red/filled and like count increases.
8. Login as the post owner and open Notifications. Confirm a like notification appears with an unread badge.
9. Add a comment to another user's post. Confirm a comment notification is created for the owner.
10. Open a notification. Confirm it becomes read.
11. Edit the profile bio/avatar URL and refresh. Confirm persistence.
12. Try a protected endpoint without a token. Expect HTTP 401.
