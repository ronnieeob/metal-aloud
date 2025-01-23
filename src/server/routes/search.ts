import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { auth } from '../middleware/auth';

const router = Router();
const controller = new SearchController();

router.get('/', auth, controller.search);

export { router as searchRouter };