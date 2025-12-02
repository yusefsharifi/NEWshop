import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ZoomIn,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  specifications_en: string;
  specifications_fa: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku: string;
  brand: string;
  rating: number;
  review_count: number;
  image_url: string;
  images?: string;
  is_bestseller: boolean;
  is_featured: boolean;
  category?: {
    name_en: string;
    name_fa: string;
    slug: string;
  };
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { t, dir, language } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: language === 'fa' ? 'سیاه' : 'Black', hex: '#000000', stock: 5 },
    { name: language === 'fa' ? 'سفید' : 'White', hex: '#FFFFFF', stock: 8 },
    { name: language === 'fa' ? 'خاکستری' : 'Gray', hex: '#9CA3AF', stock: 3 },
    { name: language === 'fa' ? 'نیلی' : 'Navy', hex: '#001F3F', stock: 6 }
  ];

  const productImages = [product?.image_url, product?.image_url, product?.image_url, product?.image_url];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        setProduct(data);

        setReviews([
          {
            id: 1,
            user_name: language === 'fa' ? 'فاطمه محمدی' : 'Fatima Mohammad',
            rating: 5,
            comment: language === 'fa'
              ? 'فوق‌العاده! کیفیت پارچه خیلی خوبه و طراحی شیک است.'
              : 'Amazing! The fabric quality is excellent and design is stylish.',
            date: '2024-01-15',
            verified: true
          },
          {
            id: 2,
            user_name: language === 'fa' ? 'علی رضایی' : 'Ali Rezaei',
            rating: 4,
            comment: language === 'fa'
              ? 'خیلی راضی‌ام. اندازه دقیق، رنگ اصلی و راحت برای پوشیدن.'
              : 'Very satisfied. Perfect fit, true color, and comfortable to wear.',
            date: '2024-01-10',
            verified: true
          },
          {
            id: 3,
            user_name: language === 'fa' ? 'مریم حسن' : 'Maryam Hassan',
            rating: 5,
            comment: language === 'fa'
              ? 'بهترین خریدی که این‌جا کردم. توصیه می‌کنم!'
              : 'Best purchase I\'ve made here. Highly recommend!',
            date: '2024-01-05',
            verified: false
          }
        ]);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, language]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(language === 'fa' ? 'لطفا اندازه و رنگ را انتخاب کنید' : 'Please select size and color');
      return;
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{language === 'fa' ? 'محصول پیدا نشد' : 'Product not found'}</h1>
          <Link to="/products">
            <Button>{language === 'fa' ? 'بازگشت به محصولات' : 'Back to Products'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const productName = language === 'fa' ? product.name_fa : product.name_en;
  const productDescription = language === 'fa' ? product.description_fa : product.description_en;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-3 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900">{language === 'fa' ? 'خانه' : 'Home'}</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-600 hover:text-gray-900">{language === 'fa' ? 'محصولات' : 'Products'}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 truncate font-medium">{productName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square group cursor-zoom-in"
            >
              <img
                src={productImages[selectedImage] || product.image_url}
                alt={productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Zoom overlay */}
              <AnimatePresence>
                {showZoom && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/10"
                  >
                    <ZoomIn className="w-8 h-8 text-white absolute bottom-4 right-4" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.is_bestseller && (
                  <Badge className="bg-green-500 text-white">{language === 'fa' ? 'پرفروش' : 'Bestseller'}</Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white">{discount}% {language === 'fa' ? 'تخفیف' : 'OFF'}</Badge>
                )}
              </div>

              {/* Floating Like Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all ${
                    selectedImage === index ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img || product.image_url} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>

            {/* Image Navigation */}
            <p className="text-sm text-gray-500">{language === 'fa' ? `تصویر ${selectedImage + 1} از 4` : `Image ${selectedImage + 1} of 4`}</p>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  <h1 className="text-h2 text-gray-900">{productName}</h1>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} {language === 'fa' ? '(' : '('}{product.review_count} {language === 'fa' ? 'نقد)' : 'reviews)'}
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">${product.price}</span>
                  {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">${product.original_price}</span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    {language === 'fa' ? `صرفه‌جویی: $${product.original_price! - product.price}` : `Save: $${product.original_price! - product.price}`}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 10
                    ? language === 'fa' ? 'موجود در انبار' : 'In Stock'
                    : product.stock_quantity > 0
                      ? language === 'fa' ? `فقط ${product.stock_quantity} عدد باقی` : `Only ${product.stock_quantity} left`
                      : language === 'fa' ? 'ناموجود' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quick Description */}
            <p className="text-gray-700 leading-relaxed">{productDescription}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {language === 'fa' ? 'رنگ' : 'Color'}
              </label>
              <div className="flex gap-4 flex-wrap">
                {colors.map((color) => (
                  <motion.button
                    key={color.hex}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`relative group ${selectedColor === color.hex ? 'ring-2 ring-offset-2 ring-gray-900' : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'}`}
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 border-gray-200 transition-all"
                      style={{ backgroundColor: color.hex }}
                    />
                    {selectedColor === color.hex && (
                      <Check className="absolute inset-0 m-auto text-white w-5 h-5" />
                    )}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                      {color.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {language === 'fa' ? 'اندازه' : 'Size'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">{language === 'fa' ? 'تعداد' : 'Quantity'}</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full h-14 text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.div
                        key="added"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        {language === 'fa' ? 'به سبد افزوده شد' : 'Added to Cart'}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {language === 'fa' ? 'افزودن به سبد' : 'Add to Cart'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  {language === 'fa' ? 'خرید سریع' : 'Buy Now'}
                </Button>
              </motion.div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              {[
                { icon: Truck, text: language === 'fa' ? 'ارسال رایگان برای سفارشات بالای 500 دلار' : 'Free shipping on orders over $500' },
                { icon: RotateCcw, text: language === 'fa' ? 'بازگشت آسان در مدت 30 روز' : 'Easy 30-day returns' },
                { icon: Check, text: language === 'fa' ? 'تضمین کیفیت و اصالت' : 'Quality & authenticity guaranteed' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <benefit.icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20"
        >
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="details" className="font-medium text-sm sm:text-base">
                {language === 'fa' ? 'جزئیات' : 'Details'}
              </TabsTrigger>
              <TabsTrigger value="material" className="font-medium text-sm sm:text-base">
                {language === 'fa' ? 'پارچه & مراقبت' : 'Material & Care'}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="font-medium text-sm sm:text-base">
                {language === 'fa' ? 'نظرات' : 'Reviews'} ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-8">
              <Card className="border-0 bg-gray-50 rounded-lg">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-h3 text-gray-900">{language === 'fa' ? 'درباره این محصول' : 'About This Item'}</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{productDescription}</p>
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fa' ? 'برند' : 'Brand'}</p>
                      <p className="font-medium text-gray-900">{product.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SKU</p>
                      <p className="font-medium text-gray-900">{product.sku}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="material" className="mt-8">
              <Card className="border-0 bg-gray-50 rounded-lg">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-h3 text-gray-900">{language === 'fa' ? 'پارچه و مراقبت' : 'Material & Care Instructions'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{language === 'fa' ? 'ترکیب پارچه' : 'Material Composition'}</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? '۱۰۰% پنبه ارگانیک' : '100% Organic Cotton'}</li>
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? 'پائین خرابی‌نپذیر' : 'Preshrunk'}</li>
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? 'رنگ پایدار' : 'Colorfast'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{language === 'fa' ? 'نحوه شستشو' : 'Washing Instructions'}</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? 'شستشوی آب سرد' : 'Wash in cold water'}</li>
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? 'برگردان پشت' : 'Turn inside out'}</li>
                        <li className="flex items-center gap-2"><span className="text-gray-400">•</span> {language === 'fa' ? 'اتو کم' : 'Low heat dry'}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <Card className="border-0 bg-gray-50 rounded-lg">
                <CardContent className="p-8 space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-h3 text-gray-900">{language === 'fa' ? 'نظرات مشتریان' : 'Customer Reviews'}</h3>
                    <Button variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-100">
                      {language === 'fa' ? 'افزودن نظر' : 'Write Review'}
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                        className="pb-6 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
                              {review.user_name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                                {review.verified && (
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                    <Check className="w-3 h-3 mr-1" /> {language === 'fa' ? 'تایید' : 'Verified'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
