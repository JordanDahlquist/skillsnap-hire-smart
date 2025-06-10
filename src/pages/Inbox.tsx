
import React from 'react';
import { InboxPage } from '@/components/inbox/InboxPage';
import { Footer } from '@/components/Footer';

export const Inbox = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <InboxPage />
      </div>
      <Footer />
    </div>
  );
};
