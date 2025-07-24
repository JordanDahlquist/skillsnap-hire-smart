-- Fix existing duplicate/spammy unique emails with professional format
-- Keep master user unchanged, update the other two users

-- Update second user: jordan@huntingtonpacificmedia.com
-- From: jordan-dahlquist1@inbound.atract.ai  
-- To: j.dahlquist@inbound.atract.ai
UPDATE public.profiles 
SET unique_email = 'j.dahlquist@inbound.atract.ai',
    updated_at = now()
WHERE email = 'jordan@huntingtonpacificmedia.com' 
AND unique_email = 'jordan-dahlquist1@inbound.atract.ai';

-- Update third user: jordan@freethefounder.ai
-- From: jordan-dahlquistq@inbound.atract.ai
-- To: hiring.jordan@inbound.atract.ai  
UPDATE public.profiles 
SET unique_email = 'hiring.jordan@inbound.atract.ai',
    updated_at = now()
WHERE email = 'jordan@freethefounder.ai' 
AND unique_email = 'jordan-dahlquistq@inbound.atract.ai';