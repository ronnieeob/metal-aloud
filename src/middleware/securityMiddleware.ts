import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../services/security/SecurityService';

export async function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const securityService = SecurityService.getInstance();
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    // Validate request
    const isValid = await securityService.validateRequest(clientIP, req.path);
    if (!isValid) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    // Validate content for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      const content = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
      
      const isContentValid = await securityService.validateContent(content);
      if (!isContentValid) {
        return res.status(400).json({ error: 'Invalid content detected' });
      }
    }

    next();
  } catch (err) {
    console.error('Security middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}