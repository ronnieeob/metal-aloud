import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService';

export class SearchController {
  private searchService = new SearchService();

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q: query } = req.query;
      
      if (typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const results = await this.searchService.search(query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}