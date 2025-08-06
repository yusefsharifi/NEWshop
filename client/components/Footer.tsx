import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, dir, language } = useLanguage();

  return (
    <footer className="bg-navy-900 text-white" dir={dir}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <div className={`flex items-center mb-4 ${dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {language === 'fa' ? 'آکواپرو' : 'AquaPro'}
                </h3>
                <p className="text-sm text-gray-300">{t('footer.company')}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {t('footer.description')}
            </p>
            <div className={`flex ${dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/category/pumps" className="text-gray-300 hover:text-white transition-colors">Pool Pumps</Link></li>
              <li><Link to="/category/filters" className="text-gray-300 hover:text-white transition-colors">Filters</Link></li>
              <li><Link to="/category/heaters" className="text-gray-300 hover:text-white transition-colors">Heaters</Link></li>
              <li><Link to="/category/chemicals" className="text-gray-300 hover:text-white transition-colors">Chemicals</Link></li>
              <li><Link to="/bundles" className="text-gray-300 hover:text-white transition-colors">Product Bundles</Link></li>
              <li><Link to="/best-sellers" className="text-gray-300 hover:text-white transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/consultation" className="text-gray-300 hover:text-white transition-colors">Free Consultation</Link></li>
              <li><Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-300 hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/warranty" className="text-gray-300 hover:text-white transition-colors">Warranty</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Pool Care Blog</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">1-800-POOL-PRO</p>
                  <p className="text-gray-300 text-sm">Mon-Fri: 8AM-8PM EST</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white">support@aquapro.com</p>
                  <p className="text-gray-300 text-sm">24/7 Email Support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white">123 Pool Equipment Dr</p>
                  <p className="text-gray-300 text-sm">Miami, FL 33101</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AquaPro Pool Equipment. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
