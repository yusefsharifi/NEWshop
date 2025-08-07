import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  X, Plus, Star, ShoppingCart, Heart, Eye, Check, 
  ArrowLeft, Scale, Package, DollarSign, Award, Info, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  category: string;
  brand: string;
  specifications: { [key: string]: string };
  features: string[];
  pros: string[];
  cons: string[];
  warranty: string;
  power?: string;
  dimensions?: string;
  weight?: string;
  material?: string;
  color?: string;
  energy_efficiency?: string;
}

interface ComparisonFeature {
  key: string;
  label_fa: string;
  label_en: string;
  type: 'text' | 'boolean' | 'rating' | 'price' | 'list';
  category: string;
}

export default function ProductComparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, dir } = useLanguage();
  const { addItem } = useCart();
  
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Comparison features configuration
  const comparisonFeatures: ComparisonFeature[] = [
    // Basic Info
    { key: 'price', label_fa: 'قیمت', label_en: 'Price', type: 'price', category: 'basic' },
    { key: 'rating', label_fa: 'امتیاز', label_en: 'Rating', type: 'rating', category: 'basic' },
    { key: 'brand', label_fa: 'برند', label_en: 'Brand', type: 'text', category: 'basic' },
    { key: 'warranty', label_fa: 'گارانتی', label_en: 'Warranty', type: 'text', category: 'basic' },
    { key: 'in_stock', label_fa: 'موجودی', label_en: 'Availability', type: 'boolean', category: 'basic' },
    
    // Technical Specs
    { key: 'power', label_fa: 'قدرت', label_en: 'Power', type: 'text', category: 'technical' },
    { key: 'dimensions', label_fa: 'ابعاد', label_en: 'Dimensions', type: 'text', category: 'technical' },
    { key: 'weight', label_fa: 'وزن', label_en: 'Weight', type: 'text', category: 'technical' },
    { key: 'material', label_fa: 'جنس', label_en: 'Material', type: 'text', category: 'technical' },
    { key: 'color', label_fa: 'رنگ', label_en: 'Color', type: 'text', category: 'technical' },
    { key: 'energy_efficiency', label_fa: 'راندمان انرژی', label_en: 'Energy Efficiency', type: 'text', category: 'technical' },
    
    // Features
    { key: 'features', label_fa: 'ویژگی‌ها', label_en: 'Features', type: 'list', category: 'features' },
    { key: 'pros', label_fa: 'نکات مثبت', label_en: 'Pros', type: 'list', category: 'features' },
    { key: 'cons', label_fa: 'نکات منفی', label_en: 'Cons', type: 'list', category: 'features' }
  ];

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: 1,
      name_en: "Pentair SuperFlow Pool Pump",
      name_fa: "پمپ استخر پنتایر سوپرفلو",
      description_en: "High-performance variable speed pool pump",
      description_fa: "پمپ استخر با سرعت متغیر و عملکرد بالا",
      price: 2500000,
      original_price: 3000000,
      discount_percentage: 16,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews_count: 24,
      in_stock: true,
      category: "pumps",
      brand: "Pentair",
      specifications: {},
      features: ["Variable Speed", "Energy Efficient", "Self-Priming", "Digital Display"],
      pros: ["بسیار کم‌صدا", "مصرف انرژی پایین", "کیفیت ساخت عالی"],
      cons: ["قیمت نسبتاً بالا"],
      warranty: "5 سال",
      power: "1.5 HP",
      dimensions: "30 × 25 × 40 سانتی‌متر",
      weight: "25 کیلوگرم",
      material: "کاست آیرن",
      color: "آبی",
      energy_efficiency: "A+++"
    },
    {
      id: 2,
      name_en: "Hayward Super Pump",
      name_fa: "پمپ استخر هایوارد سوپر",
      description_en: "Reliable single speed pool pump",
      description_fa: "پمپ استخر تک سرعته قابل اعتماد",
      price: 1800000,
      image: "/placeholder.svg",
      rating: 4.5,
      reviews_count: 18,
      in_stock: true,
      category: "pumps",
      brand: "Hayward",
      specifications: {},
      features: ["Single Speed", "Self-Priming", "Durable Design"],
      pros: ["قیمت مناسب", "دوام بالا", "تعمیر آسان"],
      cons: ["مصرف انرژی بالاتر", "کمی پرصدا"],
      warranty: "2 سال",
      power: "1 HP",
      dimensions: "28 × 23 × 38 سانتی‌متر",
      weight: "22 کیلوگرم",
      material: "کاست آیرن",
      color: "قرمز",
      energy_efficiency: "B+"
    },
    {
      id: 3,
      name_en: "Jandy FloPro Pool Pump",
      name_fa: "پمپ استخر جندی فلوپرو",
      description_en: "Mid-range pool pump with excellent reliability",
      description_fa: "پمپ استخر رده میانی با قابلیت اعتماد عالی",
      price: 2100000,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews_count: 15,
      in_stock: false,
      category: "pumps",
      brand: "Jandy",
      specifications: {},
      features: ["Variable Speed", "Quiet Operation", "Energy Star Rated"],
      pros: ["عملکرد آرام", "راندمان بالا", "طراحی مدرن"],
      cons: ["کمی گران‌تر از رقبا", "دردسترس نبودن قطعات"],
      warranty: "3 سال",
      power: "1.2 HP",
      dimensions: "29 × 24 × 39 سانتی‌متر",
      weight: "24 کیلوگرم",
      material: "آلومینیوم",
      color: "نقره‌ای",
      energy_efficiency: "A++"
    }
  ];

  useEffect(() => {
    setAvailableProducts(mockProducts);
    
    // Load products from URL params
    const productIds = searchParams.get('products')?.split(',').map(Number) || [];
    if (productIds.length > 0) {
      const products = mockProducts.filter(p => productIds.includes(p.id));
      setComparedProducts(products);
    }
  }, [searchParams]);

  const addProductToComparison = (product: Product) => {
    if (comparedProducts.length >= 4) {
      alert(language === 'fa' ? 'حداکثر ۴ محصول قابل مقایسه است' : 'Maximum 4 products can be compared');
      return;
    }
    
    if (!comparedProducts.find(p => p.id === product.id)) {
      const newProducts = [...comparedProducts, product];
      setComparedProducts(newProducts);
      updateUrlParams(newProducts);
    }
    setShowAddProduct(false);
  };

  const removeProductFromComparison = (productId: number) => {
    const newProducts = comparedProducts.filter(p => p.id !== productId);
    setComparedProducts(newProducts);
    updateUrlParams(newProducts);
  };

  const updateUrlParams = (products: Product[]) => {
    if (products.length > 0) {
      setSearchParams({ products: products.map(p => p.id).join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id.toString(),
      name: language === 'fa' ? product.name_fa : product.name_en,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  const renderFeatureValue = (product: Product, feature: ComparisonFeature) => {
    const value = (product as any)[feature.key];
    
    switch (feature.type) {
      case 'price':
        return (
          <div>
            <div className="font-bold text-lg text-blue-600">
              {formatPrice(product.price)}
            </div>
            {product.original_price && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
            {product.discount_percentage && (
              <Badge className="bg-red-500 mt-1">
                {product.discount_percentage}% {language === 'fa' ? 'تخفیف' : 'OFF'}
              </Badge>
            )}
          </div>
        );
        
      case 'rating':
        return renderStars(product.rating);
        
      case 'boolean':
        return value ? (
          <div className="flex items-center text-green-600">
            <Check className="w-4 h-4 mr-1" />
            <span>{language === 'fa' ? 'موجود' : 'Available'}</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <X className="w-4 h-4 mr-1" />
            <span>{language === 'fa' ? 'ناموجود' : 'Unavailable'}</span>
          </div>
        );
        
      case 'list':
        return value && Array.isArray(value) ? (
          <ul className="space-y-1">
            {value.map((item: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <Check className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : null;
        
      default:
        return value || <span className="text-gray-400">-</span>;
    }
  };

  const groupedFeatures = comparisonFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as { [key: string]: ComparisonFeature[] });

  const getCategoryTitle = (category: string) => {
    const titles = {
      fa: {
        basic: 'اطلاعات پایه',
        technical: 'مشخصات فنی',
        features: 'ویژگی‌ها و نکات'
      },
      en: {
        basic: 'Basic Information',
        technical: 'Technical Specifications',
        features: 'Features & Notes'
      }
    };
    return titles[language][category as keyof typeof titles.fa] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'fa' ? 'مقایسه محصولات' : 'Product Comparison'}
              </h1>
              <p className="text-gray-600">
                {language === 'fa' 
                  ? 'محصولات مختلف را با هم مقایسه کنید تا بهترین انتخاب را داشته باشید'
                  : 'Compare different products to make the best choice'
                }
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'بازگشت به محصولات' : 'Back to Products'}
              </Link>
            </Button>
          </div>
        </div>

        {comparedProducts.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'fa' ? 'هیچ محصولی برای مقایسه انتخاب نشده' : 'No products selected for comparison'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'fa' 
                  ? 'حداقل ۲ محصول انتخاب کنید تا مقایسه شروع شود'
                  : 'Select at least 2 products to start comparing'
                }
              </p>
              <Button asChild>
                <Link to="/products">
                  <Package className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'انتخاب محصولات' : 'Select Products'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Comparison Content */
          <div className="space-y-6">
            {/* Product Cards Row */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {comparedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative bg-white rounded-xl border p-4 space-y-4"
                      >
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductFromComparison(product.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>

                        {/* Product Image */}
                        <div className="aspect-square relative">
                          <img 
                            src={product.image} 
                            alt={language === 'fa' ? product.name_fa : product.name_en}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {product.discount_percentage && (
                            <Badge className="absolute top-2 left-2 bg-red-500">
                              {product.discount_percentage}% {language === 'fa' ? 'تخفیف' : 'OFF'}
                            </Badge>
                          )}
                          {!product.in_stock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <Badge variant="destructive">
                                {language === 'fa' ? 'ناموجود' : 'Out of Stock'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {language === 'fa' ? product.name_fa : product.name_en}
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            {renderStars(product.rating)}
                            <span className="text-sm text-gray-600">
                              ({product.reviews_count})
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xl font-bold text-blue-600">
                              {formatPrice(product.price)}
                            </div>
                            {product.original_price && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(product.original_price)}
                              </div>
                            )}
                          </div>

                          <Badge variant="outline">{product.brand}</Badge>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.in_stock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'fa' ? 'افزودن به سبد' : 'Add to Cart'}
                          </Button>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link to={`/product/${product.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                {language === 'fa' ? 'مشاهده' : 'View'}
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Product Button */}
                  {comparedProducts.length < 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-4 min-h-[400px]"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddProduct(true)}
                        className="flex flex-col items-center space-y-2 h-full w-full"
                      >
                        <Plus className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-600">
                          {language === 'fa' ? 'افزودن محصول' : 'Add Product'}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Comparison Table */}
            {comparedProducts.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="w-5 h-5" />
                    <span>{language === 'fa' ? 'مقایسه تفصیلی' : 'Detailed Comparison'}</span>
                  </CardTitle>
                  <CardDescription>
                    {language === 'fa' 
                      ? 'مقایسه کامل ویژگی‌ها و مشخصات محصولات'
                      : 'Complete comparison of features and specifications'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {Object.entries(groupedFeatures).map(([category, features]) => (
                      <div key={category} className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          {category === 'basic' && <Info className="w-5 h-5 mr-2 text-blue-500" />}
                          {category === 'technical' && <Zap className="w-5 h-5 mr-2 text-yellow-500" />}
                          {category === 'features' && <Award className="w-5 h-5 mr-2 text-green-500" />}
                          {getCategoryTitle(category)}
                        </h3>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-48">
                                {language === 'fa' ? 'ویژگی' : 'Feature'}
                              </TableHead>
                              {comparedProducts.map((product) => (
                                <TableHead key={product.id} className="text-center min-w-48">
                                  {language === 'fa' ? product.name_fa : product.name_en}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {features.map((feature) => (
                              <TableRow key={feature.key}>
                                <TableCell className="font-medium">
                                  {language === 'fa' ? feature.label_fa : feature.label_en}
                                </TableCell>
                                {comparedProducts.map((product) => (
                                  <TableCell key={product.id} className="text-center">
                                    {renderFeatureValue(product, feature)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {category !== 'features' && <Separator className="mt-6" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddProduct(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {language === 'fa' ? 'انتخاب محصول برای مقایسه' : 'Select Product to Compare'}
                  </h2>
                  <Button variant="ghost" onClick={() => setShowAddProduct(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts
                    .filter(product => !comparedProducts.find(p => p.id === product.id))
                    .map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <img 
                            src={product.image} 
                            alt={language === 'fa' ? product.name_fa : product.name_en}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-medium text-sm line-clamp-2 mb-2">
                            {language === 'fa' ? product.name_fa : product.name_en}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-600">
                              {formatPrice(product.price)}
                            </span>
                            <Button 
                              size="sm" 
                              onClick={() => addProductToComparison(product)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
