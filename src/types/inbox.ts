
export interface EmailThread {
  id: string;
  user_id: string;
  application_id: string | null;
  job_id: string | null;
  subject: string;
  participants: string[] | any;
  last_message_at: string;
  unread_count: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  thread_id: string;
  sender_email: string;
  recipient_email: string;
  subject: string | null;
  content: string;
  direction: 'inbound' | 'outbound';
  message_type: 'original' | 'reply';
  is_read: boolean;
  external_message_id: string | null;
  created_at: string;
}
