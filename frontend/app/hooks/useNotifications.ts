"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping SSE connection');
      return;
    }

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset reconnect attempts
    reconnectAttempts.current = 0;

    const connectSSE = () => {
      try {
        // ✅ CHANGED: Using environment variable instead of hardcoded localhost
        const url = `${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`;
        console.log('📡 Connecting to SSE:', url);
        
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
          console.log('✅ SSE connection established');
          setIsConnected(true);
          reconnectAttempts.current = 0;
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              console.log('SSE connected:', data.message);
              setIsConnected(true);
            } else if (data.type === 'unread') {
              setNotifications(data.notifications);
              setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
            } else if (data.type === 'notification') {
              setNotifications(prev => [data.notification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show browser notification
              if (typeof window !== 'undefined' && window.Notification) {
                if (Notification.permission === 'granted') {
                  new Notification(data.notification.title, {
                    body: data.notification.message,
                    icon: '/favicon.ico'
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        es.onerror = (event) => {
          console.log('❌ SSE connection error, reconnecting...');
          setIsConnected(false);
          
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          
          // Attempt to reconnect
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(2000 * (reconnectAttempts.current + 1), 10000);
            reconnectAttempts.current += 1;
            
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            console.log(`🔄 Reconnecting SSE in ${delay}ms (attempt ${reconnectAttempts.current})`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectSSE();
            }, delay);
          } else {
            console.warn('⚠️ Max SSE reconnection attempts reached.');
          }
        };
      } catch (error) {
        console.error('Error creating SSE connection:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Refresh notifications
  const refresh = () => {
    fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh
  };
}