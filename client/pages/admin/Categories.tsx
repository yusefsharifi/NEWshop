import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Package, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  slug: string;
  icon: string;
  product_count?: number;
  created_at: string;
}

export default function AdminCategories() {
  const { t, dir, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_fa: '',
    description_en: '',
    description_fa: '',
    slug: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Mock data fallback
        const mockCategories: Category[] = [
          {
            id: 1,
            name_en: 'Pool Pumps',
            name_fa: 'پمپ‌های استخر',
            description_en: 'Variable speed and single speed pumps for efficient water circulation',
            description_fa: 'پمپ‌های تک سرعته و متغیر برای گردش موث�� آب',
            slug: 'pumps',
            icon: 'Zap',
            product_count: 12,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            name_en: 'Filters',
            name_fa: 'فیلترها',
            description_en: 'Sand, cartridge, and DE filters for crystal clear pool water',
            description_fa: 'فیلترهای شنی، کارتریج و DE برای آب شفاف استخر',
            slug: 'filters',
            icon: 'Filter',
            product_count: 8,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 3,
            name_en: 'Heaters',
            name_fa: 'بخاری‌ها',
            description_en: 'Gas, electric, and heat pump heaters for year-round swimming',
            description_fa: 'بخاری‌های گازی، برقی و پمپ حرارتی برای شنا در تمام فصول',
            slug: 'heaters',
            icon: 'Thermometer',
            product_count: 6,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 4,
            name_en: 'Pool Lights',
            name_fa: 'چراغ‌های استخر',
            description_en: 'LED and fiber optic lighting systems for stunning pool ambiance',
            description_fa: 'سیستم‌های روشنایی LED و فیبر نوری برای فضای زیبای استخر',
            slug: 'lights',
            icon: 'Lightbulb',
            product_count: 15,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 5,
            name_en: 'Chemicals',
            name_fa: 'مواد شیمیایی',
            description_en: 'Professional-grade chemicals for perfect water balance',
            description_fa: 'مواد شیمیایی حرفه‌ای برای تعادل کامل آب',
            slug: 'chemicals',
            icon: 'Droplets',
            product_count: 20,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 6,
            name_en: 'Accessories',
            name_fa: 'لوازم جانبی',
            description_en: 'Covers, cleaners, and maintenance tools for complete pool care',
            description_fa: 'پوشش‌ها، تمیزکننده‌ها و ابزارهای نگهداری برای مراقبت کامل استخر',
            slug: 'accessories',
            icon: 'Wrench',
            product_count: 25,
            created_at: '2024-01-01T00:00:00Z'
          }
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCategories();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(language === 'fa' ? 'آیا از حذف این دسته‌بندی مطمئن هستید؟' : 'Are you sure you want to delete this category?')) return;
    
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_fa: '',
      description_en: '',
      description_fa: '',
      slug: '',
      icon: ''
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en,
      name_fa: category.name_fa,
      description_en: category.description_en,
      description_fa: category.description_fa,
      slug: category.slug,
      icon: category.icon
    });
    setIsDialogOpen(true);
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchQuery.toLowerCase();
    const nameToSearch = language === 'fa' ? category.name_fa : category.name_en;
    const descToSearch = language === 'fa' ? category.description_fa : category.description_en;
    
    return nameToSearch.toLowerCase().includes(searchLower) ||
           descToSearch.toLowerCase().includes(searchLower) ||
           category.slug.toLowerCase().includes(searchLower);
  });

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
              {language === 'fa' ? 'مدیریت دسته‌بندی‌ها' : 'Categories Management'}
            </h2>
            <p className="text-gray-600">
              {language === 'fa' 
                ? 'سازماندهی دسته‌بندی‌های محصولات'
                : 'Organize your product categories'
              }
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'افزودن دسته‌بندی' : 'Add Category'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory 
                    ? (language === 'fa' ? 'ویرایش دسته‌بندی' : 'Edit Category')
                    : (language === 'fa' ? 'افزودن دسته‌بندی جدید' : 'Add New Category')
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">{language === 'fa' ? 'نام (انگلیسی)' : 'Name (English)'}</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="Pool Pumps"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_fa">{language === 'fa' ? 'نام (فارسی)' : 'Name (Persian)'}</Label>
                    <Input
                      id="name_fa"
                      value={formData.name_fa}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
                      placeholder="پمپ‌های استخر"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">{language === 'fa' ? 'نامک (Slug)' : 'Slug'}</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="pumps"
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">{language === 'fa' ? 'آیکون' : 'Icon'}</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="Zap"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description_en">{language === 'fa' ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Variable speed and single speed pumps for efficient water circulation"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description_fa">{language === 'fa' ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                  <Textarea
                    id="description_fa"
                    value={formData.description_fa}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_fa: e.target.value }))}
                    placeholder="پمپ‌های تک سرعته و متغیر برای گردش موثر آب"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {language === 'fa' ? 'لغو' : 'Cancel'}
                  </Button>
                  <Button onClick={handleSaveCategory}>
                    {language === 'fa' ? 'ذخیره' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {categories.length}
                  </div>
                  <div className={`${dir === 'rtl' ? 'mr-4' : 'ml-4'}`}>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'fa' ? 'کل دسته‌بندی‌ها' : 'Total Categories'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={language === 'fa' ? 'جستجو دسته‌بندی‌ها...' : 'Search categories...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'} ({filteredCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    {language === 'fa' ? 'بارگذاری دسته‌بندی‌ها...' : 'Loading categories...'}
                  </p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {language === 'fa' ? 'هیچ دسته‌بندی یافت نشد' : 'No categories found'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredCategories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                                  <Package className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {language === 'fa' ? category.name_fa : category.name_en}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {category.product_count || 0} {language === 'fa' ? 'محصول' : 'products'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => openEditDialog(category)}
                                  title={language === 'fa' ? 'ویرایش' : 'Edit'}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title={language === 'fa' ? 'حذف' : 'Delete'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">
                              {language === 'fa' ? category.description_fa : category.description_en}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">{category.slug}</Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(category.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
