-- count chats per user
SELECT u.email, COUNT(c.id) as chat_count
FROM auth.users u
LEFT JOIN chats c ON u.id = c.user_id
GROUP BY u.email
ORDER BY chat_count DESC
