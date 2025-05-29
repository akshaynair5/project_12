import { Router } from 'express';
import {
  createGroup,
  getGroupById,
  updateGroupById,
  deleteGroupById,
  listGroupsByMemberId,
  listGroupMembers,
  updateGroupCover
} from '../controllers/group.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Create a new group
router.post('/', upload.single("coverImage"), createGroup);

// Get group info/details
router.get('/:id', getGroupById);

// Update group settings (name, description)
router.patch('/:id', updateGroupById);

// Update group profile picture
router.patch('/:id/cover', upload.single("coverImage"), updateGroupCover);

// Delete group
router.delete('/:id', deleteGroupById);

// List groups for a user (by membership)
router.get('/', listGroupsByMemberId);

// List members of a specific group
router.get('/:id/members', listGroupMembers);

export default router;
