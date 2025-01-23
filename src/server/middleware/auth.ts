import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const auth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as { id: string; role: string };
    
    next();
  } catch (error) {
    next(new ApiError('Invalid token', 401));
  }
};