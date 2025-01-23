export class SpamDetector {
  private readonly SPAM_PATTERNS = [
    /\b(viagra|cialis|casino|lottery|prize)\b/i,
    /\b(win|winner|won).{0,20}(iphone|prize|money)\b/i,
    /\b(http|https):\/\/[^\s]+\b/g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  ];

  private readonly SUSPICIOUS_PATTERNS = [
    /(.)\1{4,}/,  // Repeated characters
    /[A-Z]{5,}/,  // ALL CAPS
    /\d{10,}/     // Long number sequences
  ];

  async analyze(content: string): Promise<boolean> {
    // Check for spam patterns
    if (this.SPAM_PATTERNS.some(pattern => pattern.test(content))) {
      return false;
    }

    // Check for suspicious patterns
    let suspiciousCount = 0;
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        suspiciousCount++;
      }
    }

    // More than 2 suspicious patterns is considered spam
    if (suspiciousCount > 2) {
      return false;
    }

    // AI-based content analysis
    const spamScore = await this.getAISpamScore(content);
    return spamScore < 0.7; // Threshold for spam detection
  }

  private async getAISpamScore(content: string): Promise<number> {
    // Simple heuristic-based scoring for development
    let score = 0;
    
    // Check text characteristics
    if (content.length > 1000) score += 0.2;
    if (content.toUpperCase() === content) score += 0.3;
    if ((content.match(/http/g) || []).length > 2) score += 0.3;
    if ((content.match(/!/g) || []).length > 3) score += 0.2;
    
    return score;
  }
}