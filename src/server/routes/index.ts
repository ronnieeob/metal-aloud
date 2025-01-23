import { Router } from 'express';
import { bandsRouter } from './bands';
import { searchRouter } from './search';
import { auth } from '../middleware/auth';

const router = Router();

router.use('/bands', bandsRouter);
router.use('/search', auth, searchRouter);

export { router };