import { Router } from 'express';
import { BandsController } from '../controllers/bandsController';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();
const controller = new BandsController();

// Admin routes
router.post('/', auth, adminOnly, controller.createBand);
router.put('/:id', auth, adminOnly, controller.updateBand);
router.delete('/:id', auth, adminOnly, controller.deleteBand);
router.post('/upload-image', auth, adminOnly, controller.uploadImage);

// Public routes (still require authentication)
router.get('/', auth, controller.getBands);
router.get('/:id', auth, controller.getBand);

export { router as bandsRouter };