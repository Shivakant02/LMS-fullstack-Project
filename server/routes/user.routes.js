const express=require('express');
const { getProfile, logOut, login, register } = require('../controllers/user.controller');
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logOut);
router.get('/me', getProfile);

module.exports = router;