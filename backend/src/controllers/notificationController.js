import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Store active SSE connections
const clients = new Map();

// ============================================
// SSE STREAM - Real-time notification stream
// ============================================
export const streamNotifications = async (req, res) => {
  console.log('📡 SSE: New connection request');
  
  // Get token from query parameter
  let token = req.query.token;
  
  if (!token) {
    console.log('❌ SSE: No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    console.log(`📡 SSE: Token verified for user ${userId}`);
  } catch (error) {
    console.log('❌ SSE: Invalid token');
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  // ✅ Set headers for SSE with CORS support
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  });
  
  console.log(`📡 SSE: Headers sent for user ${userId}`);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream', userId })}\n\n`);
  
  // Store client connection
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId).push(res);
  
  console.log(`✅ SSE client connected for user ${userId} (${clients.get(userId).length} connections)`);
  
  // Send unread notifications immediately
  try {
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        isRead: false
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (unreadNotifications.length > 0) {
      res.write(`data: ${JSON.stringify({ 
        type: 'unread',
        count: unreadNotifications.length,
        notifications: unreadNotifications 
      })}\n\n`);
      console.log(`📨 Sent ${unreadNotifications.length} unread notifications to user ${userId}`);
    } else {
      console.log(`📭 No unread notifications for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error sending unread notifications:', error);
  }
  
  // Keep connection alive with heartbeat (every 15 seconds)
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch (error) {
      console.log(`⚠️ Heartbeat failed for user ${userId}:`, error.message);
      clearInterval(heartbeat);
    }
  }, 15000);
  
  // Cleanup on connection close
  req.on('close', () => {
    clearInterval(heartbeat);
    const userClients = clients.get(userId) || [];
    const index = userClients.indexOf(res);
    if (index > -1) {
      userClients.splice(index, 1);
    }
    if (userClients.length === 0) {
      clients.delete(userId);
    }
    console.log(`❌ SSE client disconnected for user ${userId} (${userClients.length} remaining)`);
  });
};

// ============================================
// SEND NOTIFICATION - Send notification to a specific user
// ============================================
export const sendNotification = async (userId, type, title, message, data = null) => {
  try {
    console.log(`📨 Sending notification to user ${userId}: ${title}`);
    
    // Save to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : null,
        isRead: false
      }
    });
    
    // Send to connected SSE clients
    const userClients = clients.get(userId) || [];
    if (userClients.length > 0) {
      const eventData = JSON.stringify({
        type: 'notification',
        notification: notification
      });
      
      let sentCount = 0;
      userClients.forEach(client => {
        try {
          client.write(`data: ${eventData}\n\n`);
          sentCount++;
        } catch (error) {
          console.error('❌ Error sending to client:', error.message);
        }
      });
      console.log(`📨 Notification sent to ${sentCount} active clients`);
    } else {
      console.log(`📨 No active clients for user ${userId}, notification saved for later`);
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return null;
  }
};

// ============================================
// GET NOTIFICATIONS - Get all notifications for logged-in user
// ============================================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// ============================================
// MARK AS READ - Mark a single notification as read
// ============================================
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await prisma.notification.update({
      where: { 
        id: parseInt(id),
        userId: userId
      },
      data: { isRead: true }
    });
    
    res.json({ 
      message: 'Notification marked as read', 
      notification 
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// ============================================
// MARK ALL AS READ - Mark all notifications as read
// ============================================
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await prisma.notification.updateMany({
      where: { 
        userId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    res.json({ 
      message: `${result.count} notifications marked as read`,
      count: result.count
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// ============================================
// DELETE NOTIFICATION - Delete a notification
// ============================================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    await prisma.notification.delete({
      where: { 
        id: parseInt(id),
        userId: userId
      }
    });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// ============================================
// GET UNREAD COUNT - Get count of unread notifications
// ============================================
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};