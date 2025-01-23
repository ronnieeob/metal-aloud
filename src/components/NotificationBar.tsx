import React, { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, UserPlus, Users, Shield, ShoppingBag, Newspaper } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NewsArticle } from '../types/social';
import { CartIcon } from './CartIcon';
import { SocialService } from '../services/api/socialService';
import { NewsService } from '../services/api/newsService';
import { useNavigation } from '../contexts/NavigationContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface Notification {
  id: string;
  type: 'message' | 'news' | 'system';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  data?: {
    messageId?: string;
    newsId?: string;
  };
}

export function NotificationBar() {
  const { user } = useAuth();
  const { setActiveSection } = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotifications] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('metal_aloud_read_notifications');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const socialService = new SocialService();
  const newsService = new NewsService();
  const notificationsRef = useClickOutside<HTMLDivElement>(() => {
    setShowNotifications(false);
  });

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        // Initialize notification count
        const storedCount = localStorage.getItem(`metal_aloud_notification_count_${user.id}`);
        setNotificationCount(storedCount ? parseInt(storedCount) : 0);

        await loadNotifications();
      };
      loadData();
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]); // Only depend on user ID

  if (!user) return null;

  const loadNotifications = async () => {
    if (!user) return;

    const isArtist = user.role === 'artist';

    try {
      // Get unread messages
      const conversations = await socialService.getConversations(user.id);
      const unreadMessages = await Promise.all(
        conversations.map(async conv => {
          const messages = await socialService.getMessages(conv.id);
          return messages.filter(msg => 
            msg.receiverId === user.id && !msg.read
          );
        })
      );

      // Get latest news only for non-artists
      let recentNews: NewsArticle[] = [];
      if (!isArtist) {
        const latestNews = await newsService.getLatestNews();
        recentNews = latestNews.slice(0, 5);
      }

      // Combine notifications
      const allNotifications: Notification[] = [
        ...unreadMessages.flat().map(msg => ({
          id: msg.id,
          type: 'message' as const,
          title: 'New Message',
          content: msg.content,
          timestamp: msg.createdAt,
          read: readNotifications.has(msg.id),
          data: { messageId: msg.id }
        })),
        ...(isArtist ? [] : recentNews.map(news => ({
          id: news.id,
          type: 'news' as const,
          title: news.title,
          content: news.content.substring(0, 100) + '...',
          timestamp: news.publishedAt,
          read: readNotifications.has(news.id),
          data: { newsId: news.id }
        })))
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    readNotifications.add(notificationId);
    localStorage.setItem('metal_aloud_read_notifications', 
      JSON.stringify(Array.from(readNotifications)));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    setNotificationCount(prev => {
      const newCount = Math.max(0, prev - 1);
      localStorage.setItem(`metal_aloud_notification_count_${user!.id}`, newCount.toString());
      return newCount;
    });

    // Store notification data for highlighting
    const notificationData = {
      id: notification.data?.messageId || notification.data?.newsId,
      timestamp: Date.now()
    };

    if (notification.type === 'message') {
      setActiveSection('messages');
      localStorage.setItem('metal_aloud_selected_message', JSON.stringify(notificationData));
    } else if (notification.type === 'news') {
      setActiveSection('news');
      localStorage.setItem('metal_aloud_selected_news', JSON.stringify(notificationData));
    } else if (notification.type === 'friend_request') {
      setActiveSection('friends');
      localStorage.setItem('metal_aloud_selected_request', JSON.stringify(notificationData));
    } else if (notification.type === 'follow') {
      setActiveSection('friends');
      // Scroll to followers section
      setTimeout(() => {
        const followersSection = document.getElementById('followers');
        if (followersSection) {
          followersSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (notification.type === 'copyright') {
      // For artists, redirect to their dashboard's copyright section
      if (user?.role === 'artist') {
        setActiveSection('artist');
        setTimeout(() => {
          const copyrightSection = document.getElementById('copyright');
          if (copyrightSection) {
            copyrightSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (notification.type === 'order') {
      setActiveSection('orders');
      localStorage.setItem('metal_aloud_selected_order', JSON.stringify(notificationData));
    }

    // Show feedback toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    toast.innerHTML = `
      <span class="text-red-400"><AlertCircle class="w-4 h-4" /></span>
      <span>Navigating to ${notification.title}...</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-6">
      <CartIcon />
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-3 transition bg-zinc-900 rounded-full border border-red-900/20 ${
          showNotifications ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
        }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div 
          ref={notificationsRef}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />

          {/* Notification Panel */}
          <div className="relative w-full max-w-2xl bg-zinc-900 rounded-lg shadow-2xl border border-red-900/20 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-red-900/20">
              <h3 className="font-semibold text-red-500">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 hover:bg-red-900/20 transition ${
                      !notification.read ? 'bg-red-900/10' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex items-center space-x-2 mt-1 ${
                      !notification.read ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      <span className="flex-shrink-0">
                        {notification.type === 'message' && <MessageCircle className="w-4 h-4" />}
                        {notification.type === 'friend_request' && <UserPlus className="w-4 h-4" />}
                        {notification.type === 'follow' && <Users className="w-4 h-4" />}
                        {notification.type === 'news' && <Newspaper className="w-4 h-4" />}
                        {notification.type === 'copyright' && <Shield className="w-4 h-4" />}
                        {notification.type === 'order' && <ShoppingBag className="w-4 h-4" />}
                      </span>
                      <p className="text-sm">{notification.content}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{notification.content}</p>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">
                  No notifications
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}