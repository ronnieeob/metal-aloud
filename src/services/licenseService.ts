import crypto from 'crypto';

interface LicenseInfo {
  key: string;
  generated: string;
  type: 'single-domain' | 'multi-domain';
  domain?: string;
  expiresAt?: string;
}

export class LicenseService {
  private static instance: LicenseService;
  private readonly SECRET_KEY = process.env.LICENSE_SECRET || 'your-secret-key';
  private readonly KEY_LENGTH = 32;

  private constructor() {}

  static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  generateLicenseKey(): string {
    // Generate a random buffer
    const buffer = crypto.randomBytes(this.KEY_LENGTH);
    
    // Create HMAC using the secret key
    const hmac = crypto.createHmac('sha256', this.SECRET_KEY);
    hmac.update(buffer);
    
    // Get the HMAC digest
    const digest = hmac.digest('hex');
    
    // Format the key in groups of 4 characters
    return digest.match(/.{4}/g)?.join('-') || digest;
  }

  validateLicenseKey(key: string, domain?: string): boolean {
    try {
      // Remove any formatting
      const cleanKey = key.replace(/-/g, '');
      
      // Verify key length
      if (cleanKey.length !== 64) {
        return false;
      }

      // Verify key format (hexadecimal)
      if (!/^[0-9a-f]{64}$/i.test(cleanKey)) {
        return false;
      }

      // Get stored license info
      const storedLicense = this.getLicenseInfo(key);
      
      if (!storedLicense) {
        return false;
      }

      // Check expiration
      if (storedLicense.expiresAt && new Date(storedLicense.expiresAt) < new Date()) {
        return false;
      }

      // Check domain if required
      if (storedLicense.type === 'single-domain' && domain) {
        if (!storedLicense.domain) {
          // First use - register domain
          this.registerDomain(key, domain);
          return true;
        }
        return storedLicense.domain === domain;
      }

      return true;
    } catch (err) {
      console.error('License validation error:', err);
      return false;
    }
  }

  private getLicenseInfo(key: string): LicenseInfo | null {
    try {
      const stored = localStorage.getItem(`metal_aloud_license_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private registerDomain(key: string, domain: string): void {
    const license = this.getLicenseInfo(key);
    if (license) {
      license.domain = domain;
      localStorage.setItem(`metal_aloud_license_${key}`, JSON.stringify(license));
    }
  }

  storeLicenseInfo(info: LicenseInfo): void {
    localStorage.setItem(`metal_aloud_license_${info.key}`, JSON.stringify(info));
  }
}