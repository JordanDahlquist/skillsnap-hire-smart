
export const securityUtils = {
  // Sanitize HTML content to prevent XSS
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate and sanitize URLs
  sanitizeUrl: (url: string): string | null => {
    try {
      const sanitized = url.trim();
      
      // Allow only http and https protocols
      if (!sanitized.match(/^https?:\/\//)) {
        return null;
      }
      
      const urlObj = new URL(sanitized);
      
      // Block potentially dangerous protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      return urlObj.toString();
    } catch {
      return null;
    }
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Sanitize file names
  sanitizeFileName: (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .trim();
  },

  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Rate limiting helper (simple in-memory implementation)
  rateLimiter: (() => {
    const attempts: Record<string, { count: number; lastAttempt: number }> = {};
    
    return {
      checkLimit: (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
        const now = Date.now();
        const record = attempts[key];
        
        if (!record || now - record.lastAttempt > windowMs) {
          attempts[key] = { count: 1, lastAttempt: now };
          return true;
        }
        
        if (record.count >= maxAttempts) {
          return false;
        }
        
        attempts[key].count += 1;
        attempts[key].lastAttempt = now;
        return true;
      },
      
      reset: (key: string): void => {
        delete attempts[key];
      }
    };
  })(),

  // Content Security Policy headers (for reference)
  getCSPDirectives: (): string => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Note: 'unsafe-inline' should be avoided in production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
  }
};

// Input validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  namePattern: /^[a-zA-Z\s'-]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/
};

// File validation
export const fileValidation = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  validateFile: (file: File, allowedTypes: string[]): { valid: boolean; error?: string } => {
    if (file.size > fileValidation.maxFileSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
  }
};
