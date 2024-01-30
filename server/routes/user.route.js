import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import  { getProfile, logOut, login, register } from '../controllers/user.controller.js';

const router = Router();


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logOut);
router.get('/me',isLoggedIn, getProfile);

export default router;