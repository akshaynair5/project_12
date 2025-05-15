import { Router } from 'express';
import {
  getUserById,
  updateUserById,
  deleteUserById,
  getUserConnections,
  getUserGroups,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers,
  changeProfilePicture
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT)

// User Profile Routes
router.get('/:id', getUserById);
router.patch('/:id', updateUserById);
router.delete('/:id', deleteUserById);

// User Relationships
router.get('/:id/connections', getUserConnections);
router.get('/:id/groups', getUserGroups);

// Connection Requests
router.get('/:id/requests/incoming', getIncomingRequests);
router.get('/:id/requests/outgoing', getOutgoingRequests);

// User Search
router.get('/search', searchUsers);
router.post('/change-profile-picture', upload.single('profilePicture') , changeProfilePicture);

export default router;
