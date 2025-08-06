import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Truck,
  Users,
  Star,
  CheckCircle,
  Zap,
  Droplets,
  Thermometer,
  Filter,
  Lightbulb,
  Wrench,
  Play,
  Award,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface Category {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  slug: string;
  icon: string;
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
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const categoriesRef = useRef(null);
  const bestSellersRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const categoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" });
  const bestSellersInView = useInView(bestSellersRef, { once: true, margin: "-100px" });

  // Mouse movement tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch best sellers
        const productsResponse = await fetch('/api/products?bestsellers=true&limit=4');
        const productsData = await productsResponse.json();
        setBestSellers(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Zap, Filter, Thermometer, Lightbulb, Droplets, Wrench
    };
    return icons[iconName] || Wrench;
  };


  const features = [
    {
      icon: Shield,
      title: t('feature.quality.title'),
      description: t('feature.quality.description')
    },
    {
      icon: Truck,
      title: t('feature.shipping.title'),
      description: t('feature.shipping.description')
    },
    {
      icon: Users,
      title: t('feature.support.title'),
      description: t('feature.support.description')
    }
  ];

  return (
    <div className="min-h-screen" dir={dir}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white overflow-hidden flex items-center"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={dir === 'rtl' ? 'text-right' : 'text-left'}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-sm font-medium mb-6"
              >
                <Award className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'بیش از ۱۰ سال تجربه' : '10+ Years of Excellence'}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
              >
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {t('home.hero.title')}
                </span>
                <br />
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                  className="text-blue-300"
                >
                  {t('home.hero.subtitle')}
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl"
              >
                {t('home.hero.description')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/products">
                    <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold shadow-2xl h-14 px-8">
                      {t('home.hero.shopButton')}
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                      </motion.div>
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-700 h-14 px-8 backdrop-blur-sm">
                    <Play className="w-5 h-5 mr-2" />
                    {t('home.hero.consultationButton')}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20"
              >
                {[
                  { number: '10K+', label: language === 'fa' ? 'مشتری راضی' : 'Happy Customers' },
                  { number: '500+', label: language === 'fa' ? 'محصول' : 'Products' },
                  { number: '24/7', label: language === 'fa' ? '��شتیبانی' : 'Support' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, type: "spring" }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative"
              style={{
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
              }}
            >
              <motion.div
                className="relative z-10"
                whileHover={{
                  rotateY: 10,
                  rotateX: 10,
                  scale: 1.05
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                  <img
                    src="/api/placeholder/500/400"
                    alt="Professional pool equipment"
                    className="w-full h-auto rounded-2xl shadow-xl"
                  />

                  {/* Floating Cards */}
                  <motion.div
                    className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {language === 'fa' ? 'کیفیت تضمینی' : 'Quality Assured'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'fa' ? 'ضمانت ۲ ساله' : '2 Year Warranty'}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {language === 'fa' ? 'فروش بالا' : 'Top Rated'}
                        </div>
                        <div className="text-sm text-gray-600">4.9/5 ⭐</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Background Decorations */}
              <motion.div
                className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400 rounded-full opacity-30 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-400 rounded-full opacity-20 blur-2xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('category.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('category.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-0 overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                const categoryName = language === 'fa' ? category.name_fa : category.name_en;
                const categoryDescription = language === 'fa' ? category.description_fa : category.description_en;

                return (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden">
                      <div className="relative">
                        <img
                          src="/api/placeholder/300/200"
                          alt={categoryName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium`}>
                          {language === 'fa' ? '+ محصول' : '+ Products'}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`}>
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{categoryName}</h3>
                        </div>
                        <p className="text-gray-600 mb-4">{categoryDescription}</p>
                        <div className={`flex items-center text-blue-600 font-medium group-hover:text-blue-700 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          {t('category.shopNow')}
                          <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('bestSellers.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('bestSellers.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="border-0 overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => {
                const productName = language === 'fa' ? product.name_fa : product.name_en;

                return (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                      <div className="relative">
                        <img
                          src={product.image_url}
                          alt={productName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute top-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} bg-green-500 text-white px-2 py-1 rounded text-xs font-medium`}>
                          {language === 'fa' ? 'پرفروش' : 'Best Seller'}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {productName}
                        </h3>
                        <div className={`flex items-center mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm text-gray-600 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>({product.review_count})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-gray-900">${product.price}</span>
                            {product.original_price && (
                              <span className={`text-sm text-gray-500 line-through ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>${product.original_price}</span>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {t('bestSellers.viewAll')}
              <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              {t('cta.consultation')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              {t('cta.call')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
