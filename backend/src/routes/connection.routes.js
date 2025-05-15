import { Router } from 'express';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection
} from '../controllers/connection.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Send a connection request
router.post('/requests', sendConnectionRequest);

// Accept a connection request
router.patch('/requests/:requestId/accept', acceptConnectionRequest);

// Reject a connection request
router.patch('/requests/:requestId/reject', rejectConnectionRequest);

// Cancel/Delete a connection request
router.delete('/requests/:requestId', cancelConnectionRequest);

// Remove a connection
router.delete('/:connectionId', removeConnection);

export default router;
