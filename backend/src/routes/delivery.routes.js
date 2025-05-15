import { Router } from 'express';
import {
  createOrUpdateDeliveryStatus,
  listDeliveryStatusForMessage,
  getDeliveryStatusForUser
} from '../controllers/delivery.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// Create or update delivery/read status for a user
router.post('/groups/:groupId/messages/:messageId/deliveryStatus', createOrUpdateDeliveryStatus);

// List all delivery/read statuses for a message
router.get('/groups/:groupId/messages/:messageId/deliveryStatus', listDeliveryStatusForMessage);

// Get delivery/read status for a specific user
router.get('/groups/:groupId/messages/:messageId/deliveryStatus/:userId', getDeliveryStatusForUser);

export default router;
