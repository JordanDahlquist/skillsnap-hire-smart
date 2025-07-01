
-- Fix ALL recent inbound messages to be marked as unread (last 24 hours)
UPDATE email_messages 
SET is_read = false 
WHERE direction = 'inbound' 
AND created_at >= NOW() - INTERVAL '24 hours';

-- Recalculate unread counts for all threads based on actual unread messages
UPDATE email_threads 
SET unread_count = (
  SELECT COUNT(*) 
  FROM email_messages 
  WHERE email_messages.thread_id = email_threads.id 
  AND email_messages.direction = 'inbound' 
  AND email_messages.is_read = false
);

-- Ensure threads with messages have proper last_message_at timestamps
UPDATE email_threads 
SET last_message_at = (
  SELECT MAX(created_at) 
  FROM email_messages 
  WHERE email_messages.thread_id = email_threads.id
)
WHERE EXISTS (
  SELECT 1 
  FROM email_messages 
  WHERE email_messages.thread_id = email_threads.id
);
