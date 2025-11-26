import { useState } from 'react';
import { Save, Globe, ShoppingCart, Mail, Bell, Shield, Database, Palette, CreditCard, MessageSquare, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  timezone: string;
  language: string;
  enableNotifications: boolean;
  enableInventoryAlerts: boolean;
  lowStockThreshold: number;
  enableEmailMarketing: boolean;
  enableSms: boolean;
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  enableReviews: boolean;
  enableWishlist: boolean;
  maintenanceMode: boolean;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    username?: string;
    password?: string;
  };
}

interface CRMSettings {
  enableSMS: boolean;
  smsProvider: string;
  smsApiKey: string;
  enableWhatsApp: boolean;
  whatsAppProvider: string;
  whatsAppApiKey: string;
  enableTelegram: boolean;
  telegramBotToken: string;
  enableEmail: boolean;
  emailProvider: string;
}

export default function AdminSettings() {
  const { t, dir, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Pool Equipment Pro',
    storeDescription: 'Professional swimming pool equipment and supplies for residential and commercial pools.',
    storeEmail: 'info@poolequipmentpro.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Pool Street, Water City, WC 12345',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
    enableNotifications: true,
    enableInventoryAlerts: true,
    lowStockThreshold: 10,
    enableEmailMarketing: false,
    enableSms: false,
    taxRate: 8.5,
    shippingRate: 15,
    freeShippingThreshold: 100,
    enableReviews: true,
    enableWishlist: true,
    maintenanceMode: false
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === 'fa' ? 'تنظیمات ذخیره شد' : 'Settings saved',
        description: language === 'fa' ? 'تنظیمات با موفقیت به‌روزرسانی شد' : 'Your settings have been updated successfully'
      });
    } catch (error) {
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' ? 'خطا در ذخیره تنظیمات' : 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof StoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'fa' ? 'تنظیمات فروشگاه' : 'Store Settings'}
            </h2>
            <p className="text-gray-600">
              {language === 'fa' 
                ? 'پیکربندی تنظیمات عمومی فروشگاه'
                : 'Configure your store preferences and settings'
              }
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 
              (language === 'fa' ? 'در حال ذخیره...' : 'Saving...') :
              (language === 'fa' ? 'ذخیره تنظیمات' : 'Save Settings')
            }
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="general">
                <Globe className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'عمومی' : 'General'}
              </TabsTrigger>
              <TabsTrigger value="commerce">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'تجارت' : 'Commerce'}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'اعلانات' : 'Notifications'}
              </TabsTrigger>
              <TabsTrigger value="features">
                <Palette className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'ویژگی‌ها' : 'Features'}
              </TabsTrigger>
              <TabsTrigger value="system">
                <Shield className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'سیستم' : 'System'}
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    {language === 'fa' ? 'تنظیمات عمومی' : 'General Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="storeName">{language === 'fa' ? 'نام فروشگاه' : 'Store Name'}</Label>
                      <Input
                        id="storeName"
                        value={settings.storeName}
                        onChange={(e) => updateSetting('storeName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeEmail">{language === 'fa' ? 'ایمیل فروشگاه' : 'Store Email'}</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => updateSetting('storeEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeDescription">{language === 'fa' ? 'توضیحات فروشگاه' : 'Store Description'}</Label>
                    <Textarea
                      id="storeDescription"
                      value={settings.storeDescription}
                      onChange={(e) => updateSetting('storeDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="storePhone">{language === 'fa' ? 'تلفن فرو��گاه' : 'Store Phone'}</Label>
                      <Input
                        id="storePhone"
                        value={settings.storePhone}
                        onChange={(e) => updateSetting('storePhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">{language === 'fa' ? 'واحد پول' : 'Currency'}</Label>
                      <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="IRR">IRR - Iranian Rial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storeAddress">{language === 'fa' ? 'آدرس فروشگاه' : 'Store Address'}</Label>
                    <Textarea
                      id="storeAddress"
                      value={settings.storeAddress}
                      onChange={(e) => updateSetting('storeAddress', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commerce Settings */}
            <TabsContent value="commerce">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {language === 'fa' ? 'تنظیمات تجاری' : 'Commerce Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="taxRate">{language === 'fa' ? 'نرخ مالیات (%)' : 'Tax Rate (%)'}</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        value={settings.taxRate}
                        onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingRate">{language === 'fa' ? 'هزینه ارسال ($)' : 'Shipping Rate ($)'}</Label>
                      <Input
                        id="shippingRate"
                        type="number"
                        value={settings.shippingRate}
                        onChange={(e) => updateSetting('shippingRate', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeShippingThreshold">{language === 'fa' ? 'حد ارسال رایگان ($)' : 'Free Shipping Threshold ($)'}</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => updateSetting('freeShippingThreshold', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="lowStockThreshold">{language === 'fa' ? 'آستانه موجودی کم' : 'Low Stock Threshold'}</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'fa' ? 'هشدار زمانی که موجودی زیر این مقدار برسد' : 'Alert when inventory falls below this number'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    {language === 'fa' ? 'تنظیمات اعلانات' : 'Notification Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'فعال‌سازی اعلانات' : 'Enable Notifications'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'دریافت اعلانات مهم سیستم' : 'Receive important system notifications'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableNotifications}
                        onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'هشدارهای موجودی' : 'Inventory Alerts'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'هشدار زمانی که موجودی کم می‌شود' : 'Get alerts when inventory is low'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableInventoryAlerts}
                        onCheckedChange={(checked) => updateSetting('enableInventoryAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'ایمیل مارکتینگ' : 'Email Marketing'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'ارسال ایمیل‌های تبلیغاتی به مشتریان' : 'Send promotional emails to customers'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableEmailMarketing}
                        onCheckedChange={(checked) => updateSetting('enableEmailMarketing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'پیامک' : 'SMS Notifications'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'ارسال پیامک برای سفارشات مهم' : 'Send SMS for important order updates'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableSms}
                        onCheckedChange={(checked) => updateSetting('enableSms', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Settings */}
            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    {language === 'fa' ? 'ویژگی‌های فروشگاه' : 'Store Features'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'سیستم نظرات' : 'Customer Reviews'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'امکان ثبت نظر برای مشتریان' : 'Allow customers to leave product reviews'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableReviews}
                        onCheckedChange={(checked) => updateSetting('enableReviews', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{language === 'fa' ? 'لیست علاقه‌مندی‌ها' : 'Wishlist'}</Label>
                        <p className="text-sm text-gray-500">
                          {language === 'fa' ? 'امکان اضافه کردن محصولات به لیست علاقه‌مندی‌ها' : 'Allow customers to save products to wishlist'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.enableWishlist}
                        onCheckedChange={(checked) => updateSetting('enableWishlist', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    {language === 'fa' ? 'تنظیمات سیستم' : 'System Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="defaultLanguage">{language === 'fa' ? 'زبان پیش‌فرض' : 'Default Language'}</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fa">فارسی</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">{language === 'fa' ? 'منطقه زمانی' : 'Timezone'}</Label>
                      <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Asia/Tehran">Tehran Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-yellow-800">{language === 'fa' ? 'حالت تعمیرات' : 'Maintenance Mode'}</Label>
                        <p className="text-sm text-yellow-700">
                          {language === 'fa' ? 'فروشگاه را موقتاً غیرفعال کنید' : 'Temporarily disable the store for maintenance'}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      <Database className="w-4 h-4 inline mr-2" />
                      {language === 'fa' ? 'پشتیبان‌گیری پایگاه داده' : 'Database Backup'}
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {language === 'fa' 
                        ? 'آخرین پشتیبان‌گیری: ۱۵ دی ۱۴۰۲'
                        : 'Last backup: January 15, 2024'
                      }
                    </p>
                    <Button variant="outline" size="sm">
                      {language === 'fa' ? 'ایجاد پشتیبان' : 'Create Backup'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
