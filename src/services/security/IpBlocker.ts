interface BlockedIP {
  ip: string;
  violations: number;
  lastViolation: number;
  blockedUntil: number;
}

export class IpBlocker {
  private blockedIPs: Map<string, BlockedIP> = new Map();
  private readonly VIOLATION_THRESHOLD = 5;
  private readonly BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async isBlocked(ip: string): Promise<boolean> {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return false;

    const now = Date.now();
    if (now > blocked.blockedUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  async addViolation(ip: string): Promise<void> {
    const now = Date.now();
    const blocked = this.blockedIPs.get(ip) || {
      ip,
      violations: 0,
      lastViolation: now,
      blockedUntil: 0
    };

    blocked.violations++;
    blocked.lastViolation = now;

    if (blocked.violations >= this.VIOLATION_THRESHOLD) {
      blocked.blockedUntil = now + this.BLOCK_DURATION;
    }

    this.blockedIPs.set(ip, blocked);
  }
}