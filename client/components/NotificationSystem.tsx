import { useState, useEffect, createContext, useContext } from 'react';
import { 
  Bell, X, Check, AlertCircle, Info, ShoppingBag, 
  Package, Truck, Gift, Star, MessageCircle, Settings,
  Volume2, VolumeX, Mail, Smartphone, Monitor
} from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'blog' | 'support';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title_en: string;
  title_fa: string;
  message_en: string;
  message_fa: string;
  action_url?: string;
  action_text_en?: string;
  action_text_fa?: string;
  image?: string;
  timestamp: string;
  is_read: boolean;
  is_persistent: boolean; // Can't be dismissed easily
  metadata?: {
    order_id?: string;
    product_id?: string;
    discount_code?: string;
  };
}

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  browser_notifications: boolean;
  sound_enabled: boolean;
  do_not_disturb: boolean;
  categories: {
    orders: boolean;
    promotions: boolean;
    system: boolean;
    blog: boolean;
    support: boolean;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    browser_notifications: true,
    sound_enabled: true,
    do_not_disturb: false,
    categories: {
      orders: true,
      promotions: true,
      system: true,
      blog: false,
      support: true
    }
  });

  // Mock notifications
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'order',
      priority: 'high',
      title_en: 'Order Shipped',
      title_fa: 'سفارش ارسال شد',
      message_en: 'Your order #ORD-001 has been shipped and is on its way to you.',
      message_fa: 'سفارش شما با شماره #ORD-001 ارسال شده و در راه شماست.',
      action_url: '/track-order/ORD-001',
      action_text_en: 'Track Order',
      action_text_fa: 'پیگیری سفارش',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: false,
      is_persistent: false,
      metadata: { order_id: 'ORD-001' }
    },
    {
      id: '2',
      type: 'promotion',
      priority: 'medium',
      title_en: 'Special Discount Available',
      title_fa: 'تخفیف ویژه موجود',
      message_en: 'Get 20% off on all pool pumps this week! Use code PUMP20',
      message_fa: 'این هفته ۲۰٪ تخفیف روی همه پمپ‌های استخر! از کد PUMP20 استفاده کنید',
      action_url: '/products?category=pumps',
      action_text_en: 'Shop Now',
      action_text_fa: 'خرید کنید',
      image: '/placeholder.svg',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      is_read: false,
      is_persistent: false,
      metadata: { discount_code: 'PUMP20' }
    },
    {
      id: '3',
      type: 'system',
      priority: 'low',
      title_en: 'Profile Update Reminder',
      title_fa: 'یادآوری بروزرسانی پروفایل',
      message_en: 'Please update your profile information to get better recommendations.',
      message_fa: 'لطفاً اطلاعات پروفایل خود را بروزرسانی کنید تا پیشنهادات بهتری دریافت کنید.',
      action_url: '/account',
      action_text_en: 'Update Profile',
      action_text_fa: 'بروزرسانی پروفایل',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      is_persistent: false
    },
    {
      id: '4',
      type: 'blog',
      priority: 'low',
      title_en: 'New Blog Post',
      title_fa: 'مقاله جدید',
      message_en: 'Check out our latest guide on winter pool maintenance.',
      message_fa: 'راهنمای جدید ما درباره نگهداری استخر در زمستان را بخوانید.',
      action_url: '/blog/winter-maintenance',
      action_text_en: 'Read More',
      action_text_fa: 'ادامه مطلب',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      is_persistent: false
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setNotifications(mockNotifications);
    }
  }, [isAuthenticated]);

  // Request browser notification permission
  useEffect(() => {
    if (preferences.browser_notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [preferences.browser_notifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'is_read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      is_read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if enabled
    if (preferences.browser_notifications && 'Notification' in window && Notification.permission === 'granted') {
      const title = language === 'fa' ? notification.title_fa : notification.title_en;
      const message = language === 'fa' ? notification.message_fa : notification.message_en;
      
      new Notification(title, {
        body: message,
        icon: '/placeholder.svg',
        tag: notification.id
      });
    }

    // Play sound if enabled
    if (preferences.sound_enabled && !preferences.do_not_disturb) {
      // Play notification sound
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if no sound file
    }
  };

  const value = {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    updatePreferences,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationBell = () => {
  const { language, dir } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'promotion': return Gift;
      case 'system': return Settings;
      case 'blog': return MessageCircle;
      case 'support': return Info;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return language === 'fa' ? 'همین الان' : 'Just now';
    if (diffMins < 60) return language === 'fa' ? `${diffMins} دقیقه پیش` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'fa' ? `${diffHours} ساعت پیش` : `${diffHours}h ago`;
    return language === 'fa' ? `${diffDays} روز پیش` : `${diffDays}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {language === 'fa' ? 'اطلاعیه‌ها' : 'Notifications'}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <Check className="w-4 h-4 mr-1" />
                {language === 'fa' ? 'همه ��ا خوانده' : 'Mark all read'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 pt-0 space-y-2">
            {notifications.length > 0 ? (
              <AnimatePresence>
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const title = language === 'fa' ? notification.title_fa : notification.title_en;
                  const message = language === 'fa' ? notification.message_fa : notification.message_en;
                  const actionText = language === 'fa' ? notification.action_text_fa : notification.action_text_en;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`border-l-4 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        getPriorityColor(notification.priority)
                      } ${!notification.is_read ? 'ring-2 ring-blue-100' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'order' ? 'bg-green-100 text-green-600' :
                          notification.type === 'promotion' ? 'bg-purple-100 text-purple-600' :
                          notification.type === 'system' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'blog' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {!notification.is_persistent && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismissNotification(notification.id);
                                  }}
                                  className="w-6 h-6 p-0 hover:bg-gray-200"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            
                            {notification.action_url && actionText && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = notification.action_url!;
                                }}
                              >
                                {actionText}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {language === 'fa' ? 'هیچ اطلاعیه‌ای ندارید' : 'No notifications yet'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const NotificationSettings = () => {
  const { language } = useLanguage();
  const { preferences, updatePreferences } = useNotifications();

  const handleCategoryToggle = (category: keyof NotificationPreferences['categories']) => {
    updatePreferences({
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category]
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>{language === 'fa' ? 'تنظیمات اطلاعیه‌ها' : 'Notification Settings'}</span>
        </CardTitle>
        <CardDescription>
          {language === 'fa' 
            ? 'نحوه دریافت اطلاعیه‌ها را تنظیم کنید'
            : 'Customize how you receive notifications'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {language === 'fa' ? 'روش‌های تحویل' : 'Delivery Methods'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'fa' ? 'اطلاعیه‌های ایمیل' : 'Email Notifications'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === 'fa' ? 'دریافت اطلاعیه‌ها از طریق ایمیل' : 'Receive notifications via email'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'fa' ? 'اطلاعیه‌های پیامکی' : 'SMS Notifications'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === 'fa' ? 'دریافت اطلاعیه‌های مهم از طریق پیامک' : 'Receive important alerts via SMS'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => updatePreferences({ sms_notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'fa' ? 'اطلاعیه‌های مرورگر' : 'Browser Notifications'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === 'fa' ? 'نمایش اطلاعیه‌ها در مرورگر' : 'Show notifications in browser'}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.browser_notifications}
                onCheckedChange={(checked) => updatePreferences({ browser_notifications: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sound & Do Not Disturb */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {language === 'fa' ? 'صدا و مزاحمت' : 'Sound & Disturbance'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {preferences.sound_enabled ? (
                  <Volume2 className="w-5 h-5 text-gray-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-500" />
                )}
                <Label className="text-sm font-medium">
                  {language === 'fa' ? 'صدای اطلاعیه' : 'Notification Sound'}
                </Label>
              </div>
              <Switch
                checked={preferences.sound_enabled}
                onCheckedChange={(checked) => updatePreferences({ sound_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                <Label className="text-sm font-medium">
                  {language === 'fa' ? 'مزاحم نشوید' : 'Do Not Disturb'}
                </Label>
              </div>
              <Switch
                checked={preferences.do_not_disturb}
                onCheckedChange={(checked) => updatePreferences({ do_not_disturb: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {language === 'fa' ? 'دسته‌بندی اطلاعیه‌ها' : 'Notification Categories'}
          </h3>
          <div className="space-y-4">
            {Object.entries(preferences.categories).map(([category, enabled]) => {
              const categoryLabels = {
                fa: {
                  orders: 'سفارشات',
                  promotions: 'تخفیفات و پیشنهادات',
                  system: 'سیستم',
                  blog: 'مقالات جدید',
                  support: 'پشتیب��نی'
                },
                en: {
                  orders: 'Orders',
                  promotions: 'Promotions & Offers',
                  system: 'System',
                  blog: 'New Articles',
                  support: 'Support'
                }
              };

              return (
                <div key={category} className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {language === 'fa' 
                      ? categoryLabels.fa[category as keyof typeof categoryLabels.fa]
                      : categoryLabels.en[category as keyof typeof categoryLabels.en]
                    }
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => handleCategoryToggle(category as keyof NotificationPreferences['categories'])}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
