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
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Index() {
  const { t, dir } = useLanguage();

  const categories = [
    {
      name: t('category.pumps.name'),
      description: t('category.pumps.description'),
      icon: Zap,
      href: '/category/pumps',
      image: '/api/placeholder/300/200',
      count: '45+ محصول'
    },
    {
      name: t('category.filters.name'),
      description: t('category.filters.description'),
      icon: Filter,
      href: '/category/filters',
      image: '/api/placeholder/300/200',
      count: '38+ محصول'
    },
    {
      name: t('category.heaters.name'),
      description: t('category.heaters.description'),
      icon: Thermometer,
      href: '/category/heaters',
      image: '/api/placeholder/300/200',
      count: '25+ محصول'
    },
    {
      name: t('category.lights.name'),
      description: t('category.lights.description'),
      icon: Lightbulb,
      href: '/category/lights',
      image: '/api/placeholder/300/200',
      count: '32+ محصول'
    },
    {
      name: t('category.chemicals.name'),
      description: t('category.chemicals.description'),
      icon: Droplets,
      href: '/category/chemicals',
      image: '/api/placeholder/300/200',
      count: '67+ محصول'
    },
    {
      name: t('category.accessories.name'),
      description: t('category.accessories.description'),
      icon: Wrench,
      href: '/category/accessories',
      image: '/api/placeholder/300/200',
      count: '89+ محصول'
    }
  ];

  const bestSellers = [
    {
      id: 1,
      name: 'Pentair SuperFlo VS Variable Speed Pump',
      price: 849,
      originalPrice: 999,
      image: '/api/placeholder/250/200',
      rating: 4.8,
      reviews: 342,
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Hayward SwimClear Cartridge Filter',
      price: 379,
      originalPrice: 449,
      image: '/api/placeholder/250/200',
      rating: 4.9,
      reviews: 189,
      badge: 'Energy Star'
    },
    {
      id: 3,
      name: 'Raypak Digital Gas Heater 266K BTU',
      price: 1299,
      originalPrice: 1499,
      image: '/api/placeholder/250/200',
      rating: 4.7,
      reviews: 156,
      badge: 'Professional Choice'
    },
    {
      id: 4,
      name: 'Jandy Pro Series LED Pool Light',
      price: 299,
      originalPrice: 399,
      image: '/api/placeholder/250/200',
      rating: 4.9,
      reviews: 234,
      badge: 'New Arrival'
    }
  ];

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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-navy-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {t('home.hero.title')}
                <span className="text-blue-300"> {t('home.hero.subtitle')}</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {t('home.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold">
                  {t('home.hero.shopButton')}
                  <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                  {t('home.hero.consultationButton')}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-lg shadow-2xl p-6">
                <img
                  src="/api/placeholder/500/400"
                  alt="Professional pool equipment"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className={`absolute -top-4 ${dir === 'rtl' ? '-left-4' : '-right-4'} w-72 h-72 bg-blue-400 rounded-full opacity-20`}></div>
              <div className={`absolute -bottom-8 ${dir === 'rtl' ? '-right-8' : '-left-8'} w-64 h-64 bg-navy-600 rounded-full opacity-30`}></div>
            </div>
          </div>
        </div>
      </section>

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
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect equipment for your pool with our comprehensive selection of professional-grade products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link key={index} to={category.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {category.count}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <category.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                      Shop Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Best Selling Equipment
            </h2>
            <p className="text-xl text-gray-600">
              Top-rated products trusted by pool professionals nationwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.badge}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                        )}
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View All Best Sellers
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Need Help Choosing the Right Equipment?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our certified pool professionals are here to help you find the perfect solution for your pool. 
            Get a free consultation and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              Schedule Free Consultation
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Call 1-800-POOL-PRO
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
