import { Router } from 'express';
import { google, login, logout, refresh, register, session } from '../controllers/auth.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(upload.single("coverImage"), register)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/refresh').post(refresh)
router.route('/google').post(google)
router.route('/session').get(verifyJWT ,session)

export default router