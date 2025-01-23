import crypto from 'crypto';

interface LicenseInfo {
  key: string;
  domain: string;
  issued: string;
  type: 'single-domain' | 'multi-domain';
}

export class LicenseValidator {
  private static instance: LicenseValidator;
  private readonly SECRET_KEY = process.env.LICENSE_SECRET || 'metal-aloud-secret-key';

  private constructor() {}

  static getInstance(): LicenseValidator {
    if (!LicenseValidator.instance) {
      LicenseValidator.instance = new LicenseValidator();
    }
    return LicenseValidator.instance;
  }

  validateKey(key: string): boolean {
    // Remove dashes
    const cleanKey = key.replace(/-/g, '');
    
    // Check length (32 chars in hex = 64 chars)
    if (cleanKey.length !== 64) return false;
    
    // Check if hexadecimal
    if (!/^[0-9a-f]{64}$/i.test(cleanKey)) return false;

    // Verify HMAC
    const hmac = crypto.createHmac('sha256', this.SECRET_KEY);
    hmac.update(cleanKey.substring(0, 32));
    const expectedHmac = hmac.digest('hex');
    
    return expectedHmac === cleanKey.substring(32);
  }

  validateDomain(key: string, domain: string): boolean {
    try {
      const licenseInfo = this.getLicenseInfo(key);
      if (!licenseInfo) return false;

      // For single-domain licenses, check domain match
      if (licenseInfo.type === 'single-domain') {
        return licenseInfo.domain === domain;
      }

      // Multi-domain licenses are always valid
      return true;
    } catch {
      return false;
    }
  }

  private getLicenseInfo(key: string): LicenseInfo | null {
    try {
      const data = localStorage.getItem(`metal_aloud_license_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  storeLicenseInfo(info: LicenseInfo): void {
    localStorage.setItem(`metal_aloud_license_${info.key}`, JSON.stringify(info));
  }
}