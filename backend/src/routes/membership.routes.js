import { Router } from 'express';
import {
  getMembershipsByQuery,
  addMembership,
  updateMembership,
  deleteMembership
} from '../controllers/membership.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Get memberships by userId or groupId
router.get('/', getMembershipsByQuery);

// Add user to group
router.post('/', addMembership);

// Update membership role (e.g., promote/demote)
router.patch('/:id', updateMembership);

// Remove user from group
router.delete('/:id', deleteMembership);

export default router;
