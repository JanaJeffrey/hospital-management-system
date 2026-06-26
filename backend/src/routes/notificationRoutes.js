import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  streamNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// ✅ SSE Stream - No auth middleware (handles token via query param)
// This MUST come BEFORE the authenticate middleware
router.get('/stream', streamNotifications);

// ✅ All other routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

export default router;