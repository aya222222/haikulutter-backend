import express from 'express';
import { getProfile, createProfile, updateProfile, getCreatorProfile, followOrUnfollowCreator, updateCreatorFollowStatus, updateTargetCreatorFollowStatus } from '../controllers/profileController.js'
import authMiddleware from '../middleware/authMiddleware.js';
// import upload from '../middleware/multer.js'

const router = express.Router();

router.get('/', authMiddleware, getProfile);
router.get('/:creator', getCreatorProfile);
router.patch('/:creator/follow', authMiddleware, followOrUnfollowCreator )
router.patch('/:creator/followed', authMiddleware, updateCreatorFollowStatus)
// router.get('/', authMiddleware, getProfile);
router.post('/', authMiddleware,   createProfile);
router.patch('/:id/updateProfile', authMiddleware,  updateProfile);

router.patch('/:targetCreator/followedTargetCreator', authMiddleware, updateTargetCreatorFollowStatus)
export default router;