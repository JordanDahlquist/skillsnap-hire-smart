
export const extractSenderName = (emailAddress: string): string => {
  if (!emailAddress) return 'Unknown';

  // Handle format: "Display Name <email@domain.com>"
  const displayNameMatch = emailAddress.match(/^(.+?)\s*<.+>$/);
  if (displayNameMatch) {
    return displayNameMatch[1].replace(/['"]/g, '').trim();
  }

  // Handle format: "email@domain.com"
  if (emailAddress.includes('@')) {
    const localPart = emailAddress.split('@')[0];
    
    // Convert common patterns to readable names
    const readable = localPart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
    
    return readable || emailAddress;
  }

  return emailAddress;
};

export const getSenderInitials = (emailAddress: string): string => {
  const name = extractSenderName(emailAddress);
  
  if (name === 'Unknown') return 'U';
  
  const words = name.split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
};

export const getEmailDomain = (emailAddress: string): string => {
  if (!emailAddress || !emailAddress.includes('@')) return '';
  
  const domain = emailAddress.split('@')[1];
  return domain ? domain.toLowerCase() : '';
};
