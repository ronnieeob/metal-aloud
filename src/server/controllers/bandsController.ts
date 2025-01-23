import { Request, Response, NextFunction } from 'express';
import { BandService } from '../services/bandService';
import { ApiError } from '../utils/ApiError';
import { validateBand } from '../validators/bandValidator';

export class BandsController {
  private bandService: BandService;

  constructor() {
    this.bandService = new BandService();
  }

  createBand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validateBand(req.body);
      const band = await this.bandService.createBand(validatedData);
      res.status(201).json(band);
    } catch (error) {
      next(error);
    }
  };

  updateBand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = validateBand(req.body);
      const band = await this.bandService.updateBand(id, validatedData);
      
      if (!band) {
        throw new ApiError('Band not found', 404);
      }
      
      res.json(band);
    } catch (error) {
      next(error);
    }
  };

  deleteBand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.bandService.deleteBand(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getBands = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const bands = await this.bandService.getBands();
      res.json(bands);
    } catch (error) {
      next(error);
    }
  };

  getBand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const band = await this.bandService.getBand(id);
      
      if (!band) {
        throw new ApiError('Band not found', 404);
      }
      
      res.json(band);
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).files?.image;
      if (!file) {
        throw new ApiError('No image file provided', 400);
      }

      const imageUrl = await this.bandService.uploadImage(file);
      res.json({ url: imageUrl });
    } catch (error) {
      next(error);
    }
  };
}