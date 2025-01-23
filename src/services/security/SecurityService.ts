import { SecurityManager } from '../../utils/security';
import { RateLimiter } from './RateLimiter';
import { SpamDetector } from './SpamDetector';
import { IpBlocker } from './IpBlocker';

export class SecurityService {
  private static instance: SecurityService;
  private securityManager = SecurityManager.getInstance();
  private rateLimiter = new RateLimiter();
  private spamDetector = new SpamDetector();
  private ipBlocker = new IpBlocker();
  
  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async validateRequest(ip: string, endpoint: string): Promise<boolean> {
    try {
      // Check if IP is blocked
      if (await this.ipBlocker.isBlocked(ip)) {
        console.warn(`Blocked request from banned IP: ${ip}`);
        return false;
      }

      // Check rate limits
      if (!this.rateLimiter.checkLimit(ip, endpoint)) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        await this.ipBlocker.addViolation(ip);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Security validation failed:', err);
      return false;
    }
  }

  async validateContent(content: string): Promise<boolean> {
    return this.spamDetector.analyze(content);
  }
}