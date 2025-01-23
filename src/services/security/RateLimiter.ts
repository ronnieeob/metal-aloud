interface RateLimit {
  count: number;
  timestamp: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimit> = new Map();
  private readonly WINDOW_MS = 60000; // 1 minute
  private readonly MAX_REQUESTS = {
    default: 100,
    auth: 5,
    api: 50
  };

  checkLimit(ip: string, endpoint: string): boolean {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const limit = this.limits.get(key);

    // Clear old entries
    if (limit && now - limit.timestamp > this.WINDOW_MS) {
      this.limits.delete(key);
    }

    // Get max requests based on endpoint
    const maxRequests = endpoint.includes('/auth')
      ? this.MAX_REQUESTS.auth
      : endpoint.includes('/api')
        ? this.MAX_REQUESTS.api
        : this.MAX_REQUESTS.default;

    if (!limit) {
      this.limits.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }
}