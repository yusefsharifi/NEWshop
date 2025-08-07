import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, Heart, ShoppingCart, Eye, TrendingUp, Sparkles, 
  Users, ThumbsUp, Clock, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  tags: string[];
  views: number;
  purchases: number;
  is_bestseller?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  similarity_score?: number;
}

interface ProductRecommendationsProps {
  currentProductId?: number;
  currentProductCategory?: string;
  currentProductTags?: string[];
  type?: 'related' | 'popular' | 'recently_viewed' | 'cross_sell' | 'upsell';
  title?: string;
  maxItems?: number;
  showTabs?: boolean;
}

export default function ProductRecommendations({
  currentProductId,
  currentProductCategory,
  currentProductTags = [],
  type = 'related',
  title,
  maxItems = 8,
  showTabs = true
}: ProductRecommendationsProps) {
  const { language, dir } = useLanguage();
  const { addItem } = useCart();
  
  const [recommendations, setRecommendations] = useState<{ [key: string]: Product[] }>({});
  const [activeTab, setActiveTab] = useState<string>(type);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      tags: ["variable-speed", "energy-efficient", "self-priming"],
      views: 1250,
      purchases: 85,
      is_bestseller: true,
      similarity_score: 0.95
    },
    {
      id: 2,
      name_en: "Hayward Sand Filter Pro Series",
      name_fa: "فیلتر شنی هایوارد پرو سری",
      description_en: "Professional sand filter system",
      description_fa: "سیستم فیلتر شنی حرفه‌ای",
      price: 1800000,
      image: "/placeholder.svg",
      rating: 4.5,
      reviews_count: 18,
      in_stock: true,
      category: "filters",
      brand: "Hayward",
      tags: ["sand-filter", "high-capacity", "durable"],
      views: 980,
      purchases: 62,
      is_bestseller: true,
      similarity_score: 0.78
    },
    {
      id: 3,
      name_en: "LED Pool Light RGB",
      name_fa: "چراغ LED استخر RGB",
      description_en: "Color-changing LED pool light",
      description_fa: "چراغ LED تغییر رنگ استخر",
      price: 650000,
      original_price: 750000,
      discount_percentage: 13,
      image: "/placeholder.svg",
      rating: 4.3,
      reviews_count: 12,
      in_stock: false,
      category: "lights",
      brand: "AquaPro",
      tags: ["led", "rgb", "remote-control"],
      views: 745,
      purchases: 38,
      is_featured: true,
      similarity_score: 0.65
    },
    {
      id: 4,
      name_en: "Pool Heater Electric 12kW",
      name_fa: "هیتر برقی استخر ۱۲ کیلووات",
      description_en: "Efficient electric pool heater",
      description_fa: "هیتر برقی کارآمد استخر",
      price: 4200000,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews_count: 15,
      in_stock: true,
      category: "heaters",
      brand: "Jandy",
      tags: ["electric", "12kw", "energy-efficient"],
      views: 620,
      purchases: 28,
      similarity_score: 0.72
    },
    {
      id: 5,
      name_en: "Automatic Pool Cleaner",
      name_fa: "جاروبرقی اتوماتیک استخر",
      description_en: "Robotic pool cleaner with smart navigation",
      description_fa: "جاروبرقی رباتیک استخر با ناوبری هوشمند",
      price: 3500000,
      original_price: 4000000,
      discount_percentage: 12,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews_count: 21,
      in_stock: true,
      category: "accessories",
      brand: "Waterway",
      tags: ["robotic", "smart-navigation", "self-cleaning"],
      views: 892,
      purchases: 45,
      is_new: true,
      similarity_score: 0.68
    },
    {
      id: 6,
      name_en: "Pool Chemical Test Kit",
      name_fa: "کیت تست مواد شیمیایی استخر",
      description_en: "Complete water testing kit",
      description_fa: "کیت کامل تست آب",
      price: 125000,
      image: "/placeholder.svg",
      rating: 4.4,
      reviews_count: 33,
      in_stock: true,
      category: "chemicals",
      brand: "AquaPro",
      tags: ["test-kit", "ph-test", "chlorine-test"],
      views: 1580,
      purchases: 156,
      is_bestseller: true,
      similarity_score: 0.55
    }
  ];

  // Recommendation algorithms
  const getRelatedProducts = (productId: number, category: string, tags: string[]) => {
    return mockProducts
      .filter(p => p.id !== productId)
      .map(product => {
        let score = 0;
        
        // Category match (high weight)
        if (product.category === category) score += 0.4;
        
        // Tag matches
        const tagMatches = product.tags.filter(tag => tags.includes(tag)).length;
        score += (tagMatches / Math.max(tags.length, product.tags.length)) * 0.3;
        
        // Brand preference (medium weight)
        // Add brand scoring logic here
        
        // Price range similarity
        // Add price range scoring logic here
        
        return { ...product, similarity_score: score };
      })
      .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
      .slice(0, maxItems);
  };

  const getPopularProducts = () => {
    return mockProducts
      .sort((a, b) => {
        // Weighted popularity score
        const scoreA = (a.purchases * 0.4) + (a.views * 0.2) + (a.rating * 0.3) + (a.reviews_count * 0.1);
        const scoreB = (b.purchases * 0.4) + (b.views * 0.2) + (b.rating * 0.3) + (b.reviews_count * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, maxItems);
  };

  const getBestsellerProducts = () => {
    return mockProducts
      .filter(p => p.is_bestseller)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, maxItems);
  };

  const getCrossSellProducts = (productId: number, category: string) => {
    // Products that are commonly bought together
    const complementaryCategories: { [key: string]: string[] } = {
      'pumps': ['filters', 'chemicals'],
      'filters': ['chemicals', 'pumps'],
      'heaters': ['pumps', 'accessories'],
      'lights': ['accessories', 'heaters'],
      'chemicals': ['accessories', 'filters'],
      'accessories': ['chemicals', 'lights']
    };

    const complementary = complementaryCategories[category] || [];
    
    return mockProducts
      .filter(p => p.id !== productId && complementary.includes(p.category))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, maxItems);
  };

  const getUpsellProducts = (productId: number, currentPrice: number) => {
    // Products in same category with higher price/better features
    const currentProduct = mockProducts.find(p => p.id === productId);
    if (!currentProduct) return [];

    return mockProducts
      .filter(p => 
        p.id !== productId && 
        p.category === currentProduct.category && 
        p.price > currentPrice && 
        p.price <= currentPrice * 2 // Max 2x price
      )
      .sort((a, b) => a.price - b.price) // Ascending price order
      .slice(0, maxItems);
  };

  const getNewProducts = () => {
    return mockProducts
      .filter(p => p.is_new)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, maxItems);
  };

  // Generate recommendations
  useEffect(() => {
    const newRecommendations: { [key: string]: Product[] } = {};

    if (currentProductId && currentProductCategory) {
      newRecommendations.related = getRelatedProducts(currentProductId, currentProductCategory, currentProductTags);
      newRecommendations.cross_sell = getCrossSellProducts(currentProductId, currentProductCategory);
      
      const currentProduct = mockProducts.find(p => p.id === currentProductId);
      if (currentProduct) {
        newRecommendations.upsell = getUpsellProducts(currentProductId, currentProduct.price);
      }
    }

    newRecommendations.popular = getPopularProducts();
    newRecommendations.bestsellers = getBestsellerProducts();
    newRecommendations.new = getNewProducts();

    setRecommendations(newRecommendations);
  }, [currentProductId, currentProductCategory, currentProductTags, maxItems]);

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
            className={`w-3 h-3 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const productName = language === 'fa' ? product.name_fa : product.name_en;
    const productDescription = language === 'fa' ? product.description_fa : product.description_en;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.discount_percentage && (
              <Badge className="bg-red-500">
                {product.discount_percentage}% {language === 'fa' ? 'تخفیف' : 'OFF'}
              </Badge>
            )}
            {product.is_new && (
              <Badge className="bg-green-500">
                <Sparkles className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'جدید' : 'New'}
              </Badge>
            )}
            {product.is_bestseller && (
              <Badge className="bg-orange-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'پرفروش' : 'Bestseller'}
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-purple-500">
                <Zap className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'ویژه' : 'Featured'}
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white/80 backdrop-blur-sm"
          >
            <Heart className="w-4 h-4" />
          </Button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button size="sm" variant="secondary" asChild>
              <Link to={`/product/${product.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                {language === 'fa' ? 'مشاهده' : 'View'}
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAddToCart(product)}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {language === 'fa' ? 'خرید' : 'Buy'}
            </Button>
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">
                {language === 'fa' ? 'ناموجود' : 'Out of Stock'}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <Link 
              to={`/product/${product.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm"
            >
              {productName}
            </Link>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {productDescription}
            </p>
          </div>

          {/* Brand & Rating */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.brand}
            </Badge>
            <div className="flex items-center space-x-1">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-600">({product.reviews_count})</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{product.purchases} {language === 'fa' ? 'خرید' : 'sold'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{product.views}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const TabContent = ({ products, tabKey }: { products: Product[], tabKey: string }) => {
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(products.length / itemsPerSlide);
    const currentProducts = products.slice(
      currentSlide * itemsPerSlide,
      (currentSlide + 1) * itemsPerSlide
    );

    return (
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {currentProducts.map((product) => (
              <ProductCard key={`${tabKey}-${product.id}`} product={product} />
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide(Math.min(totalSlides - 1, currentSlide + 1))}
              disabled={currentSlide === totalSlides - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const getTabTitle = (tabKey: string) => {
    const titles = {
      fa: {
        related: 'محصولات مرتبط',
        popular: 'محبوب‌ترین‌ها',
        bestsellers: 'پرفروش‌ترین‌ها',
        cross_sell: 'پیشنهاد ویژه',
        upsell: 'بهترین انتخاب',
        new: 'جدیدترین‌ها'
      },
      en: {
        related: 'Related Products',
        popular: 'Popular Items',
        bestsellers: 'Best Sellers',
        cross_sell: 'You May Also Like',
        upsell: 'Premium Options',
        new: 'New Arrivals'
      }
    };
    return titles[language][tabKey as keyof typeof titles.fa] || tabKey;
  };

  const getTabIcon = (tabKey: string) => {
    const icons = {
      related: Star,
      popular: TrendingUp,
      bestsellers: ThumbsUp,
      cross_sell: Users,
      upsell: Zap,
      new: Clock
    };
    return icons[tabKey as keyof typeof icons] || Star;
  };

  const availableTabs = Object.entries(recommendations).filter(([_, products]) => products.length > 0);

  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {title || getTabTitle(activeTab)}
          </CardTitle>
          <CardDescription>
            {language === 'fa' 
              ? 'محصولاتی که ممکن است برای شما جالب باشند'
              : 'Products you might be interested in'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showTabs && availableTabs.length > 1 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
                {availableTabs.slice(0, 6).map(([tabKey]) => {
                  const Icon = getTabIcon(tabKey);
                  return (
                    <TabsTrigger key={tabKey} value={tabKey} className="text-sm">
                      <Icon className="w-4 h-4 mr-1" />
                      {getTabTitle(tabKey)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {availableTabs.map(([tabKey, products]) => (
                <TabsContent key={tabKey} value={tabKey}>
                  <TabContent products={products} tabKey={tabKey} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <TabContent 
              products={recommendations[activeTab] || availableTabs[0][1]} 
              tabKey={activeTab} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
