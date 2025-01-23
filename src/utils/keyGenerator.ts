import { LicenseService } from '../services/licenseService';

export function generateInstallationKey(): string {
  const licenseService = LicenseService.getInstance();
  const key = licenseService.generateLicenseKey();
  
  // Store license info
  licenseService.storeLicenseInfo({
    key,
    generated: new Date().toISOString(),
    type: 'single-domain'
  });

  return key;
}

export function validateInstallationKey(key: string, domain: string): boolean {
  const licenseService = LicenseService.getInstance();
  return licenseService.validateLicenseKey(key, domain);
}