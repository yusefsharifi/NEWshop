import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Star,
  Package,
  DollarSign,
  Tag,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  specifications_en: string;
  specifications_fa: string;
  category_id: string;
  price: number;
  original_price: number;
  stock_quantity: number;
  sku: string;
  brand: string;
  rating: number;
  review_count: number;
  image_url: string;
  images: string[];
  is_bestseller: boolean;
  is_featured: boolean;
  is_active: boolean;
  meta_title_en: string;
  meta_title_fa: string;
  meta_description_en: string;
  meta_description_fa: string;
}

interface Category {
  id: number;
  name_en: string;
  name_fa: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name_en: '',
    name_fa: '',
    description_en: '',
    description_fa: '',
    specifications_en: '',
    specifications_fa: '',
    category_id: '',
    price: 0,
    original_price: 0,
    stock_quantity: 0,
    sku: '',
    brand: '',
    rating: 0,
    review_count: 0,
    image_url: '',
    images: [],
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    meta_title_en: '',
    meta_title_fa: '',
    meta_description_en: '',
    meta_description_fa: ''
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const mockCategories: Category[] = [
        { id: 1, name_en: 'Pool Pumps', name_fa: 'پمپ‌های استخر' },
        { id: 2, name_en: 'Filters', name_fa: 'فیلترها' },
        { id: 3, name_en: 'Heaters', name_fa: 'بخاری‌ها' },
        { id: 4, name_en: 'Pool Lights', name_fa: 'چراغ‌های استخر' },
        { id: 5, name_en: 'Chemicals', name_fa: 'مواد شیمیایی' },
        { id: 6, name_en: 'Accessories', name_fa: 'لوازم جانبی' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Simulate API call for existing product
      if (id === '1') {
        const mockProduct = {
          name_en: 'Pentair SuperFlo VS Variable Speed Pump',
          name_fa: 'پمپ متغیر سرعت پنتیر سوپرفلو',
          description_en: 'Energy-efficient variable speed pump with advanced flow control technology',
          description_fa: 'پمپ متغیر سرعت با صرفه‌جویی انرژی و تکنولوژی کنترل جریان پیشرفته',
          specifications_en: '• Variable speed technology\n• Energy Star certified\n• Quiet operation\n• Digital display\n• Self-priming design',
          specifications_fa: '• تکنولوژی سرعت متغیر\n• گواهی انرژی استار\n• عملکرد بی‌صدا\n• نمایشگر دیجیتال\n• طراحی خودپرایم',
          category_id: '1',
          price: 849,
          original_price: 999,
          stock_quantity: 25,
          sku: 'PEN-SF-VS-001',
          brand: 'Pentair',
          rating: 4.8,
          review_count: 342,
          image_url: '/api/placeholder/300/250',
          images: ['/api/placeholder/300/250', '/api/placeholder/300/250'],
          is_bestseller: true,
          is_featured: true,
          is_active: true,
          meta_title_en: 'Pentair SuperFlo VS Variable Speed Pool Pump',
          meta_title_fa: 'پمپ متغیر سرعت استخر پنتیر سوپرفلو',
          meta_description_en: 'Energy-efficient variable speed pool pump with advanced technology',
          meta_description_fa: 'پمپ متغیر سرعت استخر با صرفه‌جویی انرژی و تکنولوژی پیشرفته'
        };
        setFormData(mockProduct);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: language === 'fa' ? 'محصول ذخیره شد' : 'Product saved',
        description: language === 'fa' 
          ? 'محصول با موفقیت ذخیره شد'
          : 'Product has been saved successfully'
      });
      
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' 
          ? 'خطا در ذخیره محصول'
          : 'Failed to save product',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl],
            image_url: prev.image_url || imageUrl
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      image_url: prev.images[0] === prev.image_url && prev.images.length > 1 ? prev.images[1] : prev.image_url
    }));
  };

  const setAsMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/products')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isEditing 
                  ? (language === 'fa' ? 'ویرایش محصول' : 'Edit Product')
                  : (language === 'fa' ? 'افزودن محصول جدید' : 'Add New Product')
                }
              </h2>
              <p className="text-gray-600">
                {language === 'fa' 
                  ? 'اطلاعات کامل محصول را وارد کنید'
                  : 'Fill in all the product information below'
                }
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/admin/products')}>
              {language === 'fa' ? 'لغو' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving 
                ? (language === 'fa' ? 'در حال ذخیره...' : 'Saving...')
                : (language === 'fa' ? 'ذخیره محصول' : 'Save Product')
              }
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {language === 'fa' ? 'بارگذاری...' : 'Loading...'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">
                  <Package className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'اطلاعات پایه' : 'Basic Info'}
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'قیمت و موجودی' : 'Pricing & Stock'}
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'تصاویر' : 'Images'}
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Settings className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'SEO و تنظیمات' : 'SEO & Settings'}
                </TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      {language === 'fa' ? 'اطلاعات پایه محصول' : 'Basic Product Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name_en">{language === 'fa' ? 'نام محصول (انگلیسی)' : 'Product Name (English)'}</Label>
                        <Input
                          id="name_en"
                          value={formData.name_en}
                          onChange={(e) => updateField('name_en', e.target.value)}
                          placeholder="Pentair SuperFlo VS Variable Speed Pump"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name_fa">{language === 'fa' ? 'نام محصول (فارسی)' : 'Product Name (Persian)'}</Label>
                        <Input
                          id="name_fa"
                          value={formData.name_fa}
                          onChange={(e) => updateField('name_fa', e.target.value)}
                          placeholder="پمپ متغیر سرعت پنتیر سوپرفلو"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="category">{language === 'fa' ? 'دسته‌بندی' : 'Category'}</Label>
                        <Select value={formData.category_id} onValueChange={(value) => updateField('category_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'fa' ? 'انتخاب دسته‌بندی' : 'Select category'} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {language === 'fa' ? category.name_fa : category.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="brand">{language === 'fa' ? 'برند' : 'Brand'}</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => updateField('brand', e.target.value)}
                          placeholder="Pentair"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">{language === 'fa' ? 'کد محصول (SKU)' : 'SKU'}</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => updateField('sku', e.target.value)}
                          placeholder="PEN-SF-VS-001"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description_en">{language === 'fa' ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                      <Textarea
                        id="description_en"
                        value={formData.description_en}
                        onChange={(e) => updateField('description_en', e.target.value)}
                        placeholder="Energy-efficient variable speed pump with advanced flow control technology"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description_fa">{language === 'fa' ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                      <Textarea
                        id="description_fa"
                        value={formData.description_fa}
                        onChange={(e) => updateField('description_fa', e.target.value)}
                        placeholder="پمپ متغیر سرعت با صرفه‌جویی انرژی و تکنولوژی کنترل جریان پیشرفته"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specifications_en">{language === 'fa' ? 'مشخصات فنی (انگلیسی)' : 'Specifications (English)'}</Label>
                      <Textarea
                        id="specifications_en"
                        value={formData.specifications_en}
                        onChange={(e) => updateField('specifications_en', e.target.value)}
                        placeholder="• Variable speed technology&#10;• Energy Star certified&#10;• Quiet operation"
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specifications_fa">{language === 'fa' ? 'مشخصات فنی (فارسی)' : 'Specifications (Persian)'}</Label>
                      <Textarea
                        id="specifications_fa"
                        value={formData.specifications_fa}
                        onChange={(e) => updateField('specifications_fa', e.target.value)}
                        placeholder="• تکنولوژی سرعت متغیر&#10;• گواهی انرژی استار&#10;• عملکرد بی‌صدا"
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing & Stock */}
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      {language === 'fa' ? 'قیمت و موجودی' : 'Pricing & Inventory'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="price">{language === 'fa' ? 'قیمت فروش ($)' : 'Sale Price ($)'}</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="original_price">{language === 'fa' ? 'قیمت اصلی ($)' : 'Original Price ($)'}</Label>
                        <Input
                          id="original_price"
                          type="number"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) => updateField('original_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock_quantity">{language === 'fa' ? 'موجودی' : 'Stock Quantity'}</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => updateField('stock_quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="rating">{language === 'fa' ? 'امتیاز (0-5)' : 'Rating (0-5)'}</Label>
                        <Input
                          id="rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={formData.rating}
                          onChange={(e) => updateField('rating', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="review_count">{language === 'fa' ? 'تعداد نظرات' : 'Review Count'}</Label>
                        <Input
                          id="review_count"
                          type="number"
                          value={formData.review_count}
                          onChange={(e) => updateField('review_count', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {formData.original_price > formData.price && formData.price > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Tag className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">
                            {language === 'fa' ? 'تخفیف:' : 'Discount:'} 
                            {' '}{Math.round(((formData.original_price - formData.price) / formData.original_price) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images */}
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      {language === 'fa' ? 'تصاویر محصول' : 'Product Images'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Drag & Drop Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {language === 'fa' ? 'تصاویر را اینجا بکشید' : 'Drag images here'}
                          </p>
                          <p className="text-gray-500">
                            {language === 'fa' ? 'یا کلیک کنید تا فایل انتخاب کنید' : 'or click to select files'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {language === 'fa' ? 'انتخاب تصاویر' : 'Select Images'}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        />
                      </div>
                    </div>

                    {/* Image Gallery */}
                    {formData.images.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium mb-4">
                          {language === 'fa' ? 'تصاویر آپلود شده' : 'Uploaded Images'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <AnimatePresence>
                            {formData.images.map((image, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group"
                              >
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                  <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                {/* Main Image Badge */}
                                {formData.image_url === image && (
                                  <Badge className="absolute top-2 left-2 bg-blue-600">
                                    {language === 'fa' ? 'اصلی' : 'Main'}
                                  </Badge>
                                )}

                                {/* Actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                  {formData.image_url !== image && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => setAsMainImage(image)}
                                    >
                                      <Star className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO & Settings */}
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      {language === 'fa' ? 'SEO و تنظیمات' : 'SEO & Settings'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="meta_title_en">{language === 'fa' ? 'عنوان متا (انگلیسی)' : 'Meta Title (English)'}</Label>
                        <Input
                          id="meta_title_en"
                          value={formData.meta_title_en}
                          onChange={(e) => updateField('meta_title_en', e.target.value)}
                          placeholder="Pentair SuperFlo VS Variable Speed Pool Pump"
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta_title_fa">{language === 'fa' ? 'عنوان متا (فارسی)' : 'Meta Title (Persian)'}</Label>
                        <Input
                          id="meta_title_fa"
                          value={formData.meta_title_fa}
                          onChange={(e) => updateField('meta_title_fa', e.target.value)}
                          placeholder="پمپ متغیر سرعت استخر پنتیر سوپرفلو"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="meta_description_en">{language === 'fa' ? 'توضیحات متا (انگلیسی)' : 'Meta Description (English)'}</Label>
                      <Textarea
                        id="meta_description_en"
                        value={formData.meta_description_en}
                        onChange={(e) => updateField('meta_description_en', e.target.value)}
                        placeholder="Energy-efficient variable speed pool pump with advanced technology"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_description_fa">{language === 'fa' ? 'توضیحات متا (فارسی)' : 'Meta Description (Persian)'}</Label>
                      <Textarea
                        id="meta_description_fa"
                        value={formData.meta_description_fa}
                        onChange={(e) => updateField('meta_description_fa', e.target.value)}
                        placeholder="پمپ متغیر سرعت استخر با صرفه‌جویی انرژی و تکنولوژی پیشرفته"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">
                        {language === 'fa' ? 'تنظیمات نمایش' : 'Display Settings'}
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{language === 'fa' ? 'محصول فعال' : 'Product Active'}</Label>
                            <p className="text-sm text-gray-500">
                              {language === 'fa' ? 'محصول در فروشگاه نمایش داده می‌شود' : 'Product will be visible in store'}
                            </p>
                          </div>
                          <Switch 
                            checked={formData.is_active}
                            onCheckedChange={(checked) => updateField('is_active', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{language === 'fa' ? 'محصول ویژه' : 'Featured Product'}</Label>
                            <p className="text-sm text-gray-500">
                              {language === 'fa' ? 'در بخش محصولات ویژه نمایش داده می‌شود' : 'Show in featured products section'}
                            </p>
                          </div>
                          <Switch 
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => updateField('is_featured', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{language === 'fa' ? 'پرفروش' : 'Bestseller'}</Label>
                            <p className="text-sm text-gray-500">
                              {language === 'fa' ? 'در بخش پرفروش‌ترین‌ها نمایش داده می‌شود' : 'Show in bestsellers section'}
                            </p>
                          </div>
                          <Switch 
                            checked={formData.is_bestseller}
                            onCheckedChange={(checked) => updateField('is_bestseller', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
