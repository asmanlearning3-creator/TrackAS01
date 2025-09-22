import { jwtDecode } from 'jwt-decode';

// Security service for authentication and authorization
export class SecurityService {
  private static instance: SecurityService;
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // JWT Token decoding (frontend-safe)
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Token decoding failed:', error);
      throw new Error('Invalid token format');
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  // Simple password validation (frontend only)
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Role-based access control
  hasPermission(userRole: string, requiredPermission: string): boolean {
    const rolePermissions = {
      admin: [
        'manage_users',
        'approve_shipments', 
        'view_all_analytics',
        'manage_disputes',
        'system_settings',
        'user_verification',
        'platform_governance'
      ],
      logistics: [
        'create_shipments',
        'manage_fleet',
        'view_company_analytics',
        'assign_operators',
        'manage_customers',
        'approve_company_shipments',
        'billing_management'
      ],
      operator: [
        'view_available_jobs',
        'accept_shipments',
        'update_delivery_status',
        'view_earnings',
        'update_location',
        'contact_customers',
        'upload_delivery_proof'
      ],
      customer: [
        'view_own_shipments',
        'track_orders',
        'download_invoices',
        'provide_feedback',
        'manage_profile',
        'contact_support',
        'rate_service'
      ]
    };

    const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
    return permissions.includes(requiredPermission);
  }

  // API Key generation for companies
  generateApiKey(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const combined = `${timestamp}-${random}`;
    
    return Buffer.from(combined).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  // Rate limiting
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Input validation and sanitization
  validateInput(input: any, rules: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (rules.email && input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone validation
    if (rules.phone && input.phone) {
      const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
      if (!phoneRegex.test(input.phone)) {
        errors.push('Invalid phone number format');
      }
    }

    // Required fields
    if (rules.required) {
      rules.required.forEach((field: string) => {
        if (!input[field] || input[field].toString().trim() === '') {
          errors.push(`${field} is required`);
        }
      });
    }

    // String length validation
    if (rules.minLength) {
      Object.entries(rules.minLength).forEach(([field, minLen]) => {
        if (input[field] && input[field].length < minLen) {
          errors.push(`${field} must be at least ${minLen} characters`);
        }
      });
    }

    // Numeric validation
    if (rules.numeric) {
      rules.numeric.forEach((field: string) => {
        if (input[field] && isNaN(Number(input[field]))) {
          errors.push(`${field} must be a valid number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Generate secure session
  generateSession(userId: string, userRole: string): any {
    const sessionId = this.generateApiKey();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      sessionId,
      userId,
      userRole,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      lastActivity: new Date()
    };
  }

  // Audit logging
  async logSecurityEvent(
    event: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access',
    userId: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const logEntry = {
        id: `SEC-${Date.now()}`,
        event,
        userId,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
        severity: this.getEventSeverity(event)
      };

      // In production, store in secure audit log database
      console.log('Security Event:', logEntry);
      
      // Alert on suspicious activities
      if (logEntry.severity === 'high') {
        await this.alertSecurityTeam(logEntry);
      }
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }

  private getEventSeverity(event: string): 'low' | 'medium' | 'high' {
    switch (event) {
      case 'failed_login':
      case 'permission_denied':
        return 'high';
      case 'login':
      case 'logout':
        return 'low';
      default:
        return 'medium';
    }
  }

  private async alertSecurityTeam(logEntry: any): Promise<void> {
    // In production, send alerts to security team
    console.warn('Security Alert:', logEntry);
  }

  // Data encryption for sensitive information
  encryptSensitiveData(data: string): string {
    // In production, use proper encryption library (crypto-js, node crypto)
    return Buffer.from(data).toString('base64');
  }

  decryptSensitiveData(encryptedData: string): string {
    // In production, use proper decryption
    return Buffer.from(encryptedData, 'base64').toString();
  }

  // Multi-factor authentication setup
  generateMFASecret(): string {
    // In production, use proper TOTP library
    return Math.random().toString(36).substring(2, 15);
  }

  verifyMFAToken(secret: string, token: string): boolean {
    // In production, implement proper TOTP verification
    return token.length === 6 && /^\d+$/.test(token);
  }

  // Session management
  private activeSessions = new Map<string, any>();

  createSession(userId: string, userRole: string): string {
    const session = this.generateSession(userId, userRole);
    this.activeSessions.set(session.sessionId, session);
    return session.sessionId;
  }

  validateSession(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive || new Date() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  invalidateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // Security headers for API responses
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

export const securityService = SecurityService.getInstance();