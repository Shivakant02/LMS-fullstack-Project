import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import  { changePassword, forgetPassword, getProfile, logOut, login, register, resetPassword, updateProfile } from '../controllers/user.controller.js';
import upload from '../middleware/multer.middleware.js';

const router = Router();


router.post('/register',upload.single('avatar'), register);
router.post('/login', login);
router.get('/logout', logOut);
router.get('/me', isLoggedIn, getProfile);
router.post('/reset', forgetPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('change-password', isLoggedIn, changePassword)
router.put('/update', isLoggedIn, upload.single('avatar', updateProfile));


export default router;