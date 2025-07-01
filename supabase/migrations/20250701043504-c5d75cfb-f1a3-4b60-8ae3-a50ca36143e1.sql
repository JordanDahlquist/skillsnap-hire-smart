
-- Step 1: Fix existing inbound messages to be marked as unread
UPDATE email_messages 
SET is_read = false 
WHERE direction = 'inbound' 
AND is_read = true 
AND created_at >= NOW() - INTERVAL '24 hours';

-- Step 2: Remove duplicate messages (keep the latest one for each external_message_id)
DELETE FROM email_messages 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY external_message_id, sender_email, subject 
             ORDER BY created_at DESC
           ) as rn
    FROM email_messages 
    WHERE direction = 'inbound' 
    AND external_message_id IS NOT NULL
    AND created_at >= NOW() - INTERVAL '24 hours'
  ) ranked 
  WHERE rn > 1
);

-- Step 3: Recalculate unread counts for all threads
UPDATE email_threads 
SET unread_count = (
  SELECT COUNT(*) 
  FROM email_messages 
  WHERE email_messages.thread_id = email_threads.id 
  AND email_messages.direction = 'inbound' 
  AND email_messages.is_read = false
);
