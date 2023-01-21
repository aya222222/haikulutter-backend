import express from 'express';
import { getPosts, getPostsBySearch, createPost, updatePost, deletePost, likePost, getPost, commentPost, getUserPosts, deleteComment } from '../controllers/postController.js'
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.cjs'
// const upload = require('../middleware/multer.cjs')
const router = express.Router();

router.get('/search', getPostsBySearch);
router.get('/', getPosts)
router.get('/:creator', getUserPosts)
router.post('/', authMiddleware, upload.single('selectedFile'), createPost)
router.patch('/:id', authMiddleware, upload.single('selectedFile'), updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.patch('/:id/likePost', authMiddleware,  likePost);
router.get('/:id/getPost',  getPost);
router.post('/:id/commentPost', authMiddleware,  commentPost);
router.patch('/post/:id/commentDelete', authMiddleware,  deleteComment)
export default router;

