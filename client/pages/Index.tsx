import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Star,
  Heart,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface Category {
  id: number;
  name_en: string;
  name_fa: string;
  slug: string;
}

interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  image_url: string;
  is_bestseller: boolean;
}

export default function Index() {
  const { t, dir, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.slice(0, 6));

        const productsResponse = await fetch('/api/products?limit=8');
        const productsData = await productsResponse.json();
        setLatestProducts(productsData.slice(0, 4));
        setBestSellers(productsData.filter((p: Product) => p.is_bestseller).slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroContent = [
    {
      title: language === 'fa' ? 'تی‌شرت‌های برتر' : 'Premium T-Shirts',
      subtitle: language === 'fa' ? 'کیفیت، سبک، راحتی' : 'Quality. Style. Comfort',
      image: '/api/placeholder/1200/600'
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      {/* Hero Section - Minimal Modern */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative h-screen bg-white text-gray-900 overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroContent[0].image}
            alt="Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg font-light text-gray-600 mb-4 uppercase tracking-widest"
            >
              {language === 'fa' ? 'مجموعه جدید' : 'New Collection'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-h1 text-gray-900 mb-6 max-w-4xl"
            >
              {heroContent[0].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-gray-700 mb-10 max-w-2xl font-light"
            >
              {heroContent[0].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link to="/products">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 font-medium h-14 px-8">
                  {language === 'fa' ? 'خریداری کنید' : 'Shop Now'}
                  <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-h2 text-gray-900 mb-4">
              {language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'}
            </h2>
            <div className="w-16 h-1 bg-gray-900"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const categoryName = language === 'fa' ? category.name_fa : category.name_en;
                return (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative h-48 rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                    >
                      <img
                        src="/api/placeholder/300/400"
                        alt={categoryName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
                      <div className="absolute inset-0 flex items-end p-4">
                        <p className="text-white font-semibold text-sm">{categoryName}</p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-h2 text-gray-900 mb-4">
                {language === 'fa' ? 'جدیدترین‌ها' : 'Latest Arrivals'}
              </h2>
              <div className="w-16 h-1 bg-gray-900"></div>
            </div>
            <Link to="/products" className="text-gray-900 font-medium hover:text-gray-600 transition-colors flex items-center gap-2">
              {language === 'fa' ? 'مشاهده همه' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-80 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} language={language} dir={dir} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-h2 text-gray-900 mb-4">
                {language === 'fa' ? 'پرفروش‌ترین‌ها' : 'Bestsellers'}
              </h2>
              <div className="w-16 h-1 bg-gray-900"></div>
            </div>
            <Link to="/products?bestsellers=true" className="text-gray-900 font-medium hover:text-gray-600 transition-colors flex items-center gap-2">
              {language === 'fa' ? 'مشاهده همه' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-80 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} language={language} dir={dir} showBadge />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-h2 text-gray-900 mb-4">
              {language === 'fa' ? 'مجموعه بهاری' : 'Spring Collection'}
            </h2>
            <div className="w-16 h-1 bg-gray-900"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="h-96 rounded-lg overflow-hidden bg-gray-200 relative group cursor-pointer"
              >
                <img
                  src={`/api/placeholder/400/600`}
                  alt={`Look ${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-6">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium mb-3">
                      {language === 'fa' ? `نگاه ${i}` : `Look ${i}`}
                    </p>
                    <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                      {language === 'fa' ? 'مشاهده' : 'View'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-gray-900 mb-4">
              {language === 'fa' ? 'نظر مشتریان' : 'Customer Reviews'}
            </h2>
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 text-lg">
              {language === 'fa' ? '۴.۹ از ۵ ستاره بر اساس ۱۲۰۰+ نقد' : '4.9 out of 5 based on 1200+ reviews'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 font-light">
                    {language === 'fa'
                      ? 'کیفیت فوق‌العاده و تحویل سریع. دوباره خریداری خواهم کرد!'
                      : 'Exceptional quality and fast delivery. Will buy again!'}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {language === 'fa' ? 'فاطمه' : 'Sarah'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {language === 'fa' ? 'خریدار تایید‌شده' : 'Verified Buyer'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h1 text-white mb-6">
            {language === 'fa' ? 'آغاز سفر سبک خود' : 'Start Your Style Journey'}
          </h2>
          <p className="text-xl font-light text-gray-300 mb-10">
            {language === 'fa'
              ? 'کالکشن انحصاری و تخفیف‌های ویژه برای مشترکین'
              : 'Exclusive collections and special discounts for subscribers'}
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row max-w-md mx-auto">
            <input
              type="email"
              placeholder={language === 'fa' ? 'ایمیل خود را وارد کنید' : 'Enter your email'}
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 font-light focus:outline-none"
            />
            <Button className="bg-white text-gray-900 hover:bg-gray-100 font-medium">
              {language === 'fa' ? 'اشتراک' : 'Subscribe'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  language,
  dir,
  showBadge = false
}: {
  product: Product;
  language: string;
  dir: string;
  showBadge?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const productName = language === 'fa' ? product.name_fa : product.name_en;

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div whileHover={{ scale: 1.02 }} className="h-full">
        <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden group h-80">
          <img
            src={product.image_url}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {showBadge && (
            <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-green-500 text-white px-3 py-1 rounded text-xs font-medium`}>
              {language === 'fa' ? 'پرفروش' : 'Best Seller'}
            </div>
          )}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} p-2 rounded-full transition-colors`}
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            />
          </motion.button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
            {productName}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">${product.price}</span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
