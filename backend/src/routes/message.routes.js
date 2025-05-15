import { Router } from 'express';
import {
  sendGroupMessage,
  listGroupMessages,
  getSingleMessage,
  updateMessage,
  deleteMessage,
  addOrUpdateReaction,
  removeReaction,
  replyToMessage
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware to verify JWT token
router.use(verifyJWT);

// --- Group Messages ---

// Send a message to group
router.post('/groups/:groupId/messages', sendGroupMessage);

// List or paginate group messages
router.get('/groups/:groupId/messages', listGroupMessages);

// Get a single message
router.get('/groups/:groupId/messages/:messageId', getSingleMessage);

// Edit a message
router.patch('/groups/:groupId/messages/:messageId', updateMessage);

// Delete a message (soft or hard delete)
router.delete('/groups/:groupId/messages/:messageId', deleteMessage);

// --- Reactions ---

// Add or update a reaction to a message
router.post('/groups/:groupId/messages/:messageId/reactions', addOrUpdateReaction);

// Remove a reaction for the user
router.delete('/groups/:groupId/messages/:messageId/reactions/:reactionType', removeReaction);

// --- Threaded Replies (Optional) ---

// Reply to a message (create a threaded reply)
router.post('/groups/:groupId/messages/:messageId/replies', replyToMessage);

export default router;
