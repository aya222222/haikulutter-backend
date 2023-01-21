import express from 'express';
import { login, signup } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login)
router.post('/signup', signup)

export default router;

