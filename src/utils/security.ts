/// <reference types="vite/client" />
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = (import.meta.env.VITE_ENCRYPTION_KEY as string) || 'metal-aloud-secret-key-2024';

export class SecurityManager {
  private static instance: SecurityManager;
  private readonly installationId: string;
  private readonly xssFilter = /[<>]/g;
  private readonly sqlFilter = /['";]/g;

  private constructor() {
    this.installationId = '';
    this.initializeInstallationId();
  }

  private async initializeInstallationId() {
    this.installationId = await this.generateInstallationId();
  }

  // Sanitize input to prevent XSS
  public sanitizeInput(input: string): string {
    return input.replace(this.xssFilter, '');
  }

  // Sanitize SQL input
  public sanitizeSqlInput(input: string): string {
    return input.replace(this.sqlFilter, '');
  }

  // Encrypt sensitive data
  public encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  public decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Generate secure random token
  public generateSecureToken(length: number = 32): string {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }

  // Validate password strength
  public validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength &&
           hasUpperCase &&
           hasLowerCase &&
           hasNumbers &&
           hasSpecialChar;
  }

  // Rate limiting check
  private rateLimits: Map<string, number[]> = new Map();
  
  public checkRateLimit(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const timestamps = this.rateLimits.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < window);
    
    if (validTimestamps.length >= limit) {
      return false;
    }
    
    validTimestamps.push(now);
    this.rateLimits.set(key, validTimestamps);
    return true;
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async generateInstallationId(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    
    const data = `${timestamp}-${random}-${window.location.hostname}`;
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  public validateInstallation(): boolean {
    try {
      // In development, allow all domains
      if (import.meta.env.DEV) {
        return true;
      }

      // Check for secure context
      if (window.isSecureContext === false) {
        console.error('Insecure context');
        return false;
      }

      // Verify Content Security Policy
      if (!document.head.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        console.error('Missing CSP');
        return false;
      }

      // Additional security checks can be added here
      return true;
    } catch (err) {
      console.error('Security validation failed:', err);
      return false;
    }
  }

  public getInstallationId(): string {
    return this.installationId;
  }
}