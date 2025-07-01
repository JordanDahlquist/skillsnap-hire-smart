
export const extractSenderName = (emailAddress: string): string => {
  if (!emailAddress) return 'Unknown';

  // Handle format: "Display Name <email@domain.com>"
  const displayNameMatch = emailAddress.match(/^(.+?)\s*<.+>$/);
  if (displayNameMatch) {
    const name = displayNameMatch[1].replace(/['"]/g, '').trim();
    // Clean up common prefixes/suffixes
    return name.replace(/^(Mr\.?|Ms\.?|Mrs\.?|Dr\.?)\s+/i, '');
  }

  // Handle format: "email@domain.com"
  if (emailAddress.includes('@')) {
    const localPart = emailAddress.split('@')[0];
    
    // Convert common patterns to readable names
    const readable = localPart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
    
    // Don't return generic patterns
    if (readable.match(/^(no|reply|noreply|admin|support|info)$/i)) {
      return getEmailDomain(emailAddress);
    }
    
    return readable || emailAddress;
  }

  return emailAddress;
};

export const getSenderInitials = (emailAddress: string): string => {
  const name = extractSenderName(emailAddress);
  
  if (name === 'Unknown') return 'U';
  
  // If it's a domain name, use the first two letters
  if (name.includes('.')) {
    return name.substring(0, 2).toUpperCase();
  }
  
  const words = name.split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  // Take first letter of first two words
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
};

export const getEmailDomain = (emailAddress: string): string => {
  if (!emailAddress || !emailAddress.includes('@')) return '';
  
  const domain = emailAddress.split('@')[1];
  if (!domain) return '';
  
  // Make domain more readable
  const cleanDomain = domain.toLowerCase();
  
  // Common domain mappings
  const domainMappings: Record<string, string> = {
    'gmail.com': 'Gmail',
    'yahoo.com': 'Yahoo',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'icloud.com': 'iCloud',
    'protonmail.com': 'ProtonMail'
  };
  
  return domainMappings[cleanDomain] || cleanDomain.replace('.com', '').replace('.', '');
};

export const formatSenderForDisplay = (emailAddress: string, includeEmail: boolean = false): string => {
  const name = extractSenderName(emailAddress);
  const domain = getEmailDomain(emailAddress);
  
  if (name === domain || name === 'Unknown') {
    return includeEmail ? emailAddress : domain;
  }
  
  return includeEmail ? `${name} (${emailAddress})` : name;
};
