import { Router } from 'express';
import {
  getUserById,
  updateUserById,
  deleteUserById,
  getUserConnections,
  getUserGroups,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT)

// User Profile Routes
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

// User Relationships
router.get('/users/:id/connections', getUserConnections);
router.get('/users/:id/groups', getUserGroups);

// Connection Requests
router.get('/users/:id/requests/incoming', getIncomingRequests);
router.get('/users/:id/requests/outgoing', getOutgoingRequests);

// User Search
router.get('/users/search', searchUsers);

export default router;
