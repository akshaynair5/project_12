import { Router } from 'express';
import { google, login, logout, refresh, register, session } from '../controllers/auth.controller.js';

const router = Router();

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/refresh').post(refresh)
router.route('/google').post(google)
router.route('/session').get(session)

export default router