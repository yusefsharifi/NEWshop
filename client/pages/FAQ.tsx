import { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle, 
  Phone, Mail, ThumbsUp, ThumbsDown, Users, FileText, Settings,
  Wrench, DollarSign, Truck, Shield, Plus, Filter, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: number;
  question_en: string;
  question_fa: string;
  answer_en: string;
  answer_fa: string;
  category: string;
  tags: string[];
  helpful_count: number;
  not_helpful_count: number;
  views: number;
  priority: number;
  last_updated: string;
  related_products?: number[];
  video_url?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'video';
  }>;
}

interface FAQCategory {
  id: string;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  icon: string;
  color: string;
  faq_count: number;
}

export default function FAQ() {
  const { language, dir } = useLanguage();
  
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [userVotes, setUserVotes] = useState<{[key: number]: 'helpful' | 'not_helpful'}>({});

  // Mock FAQ categories
  const mockCategories: FAQCategory[] = [
    {
      id: 'general',
      name_en: 'General Questions',
      name_fa: 'سؤالات عمومی',
      description_en: 'Basic questions about our services',
      description_fa: 'سؤالات پایه درباره خدمات ما',
      icon: 'HelpCircle',
      color: 'blue',
      faq_count: 15
    },
    {
      id: 'products',
      name_en: 'Products & Equipment',
      name_fa: 'محصولات و تجهیزات',
      description_en: 'Questions about pool equipment and products',
      description_fa: 'سؤالات درباره تجهیزات و محصولات استخر',
      icon: 'Package',
      color: 'green',
      faq_count: 23
    },
    {
      id: 'maintenance',
      name_en: 'Maintenance & Care',
      name_fa: 'نگهداری و مراقبت',
      description_en: 'Pool maintenance and care guidelines',
      description_fa: 'راهنمای نگهداری و مراقبت از استخر',
      icon: 'Wrench',
      color: 'orange',
      faq_count: 18
    },
    {
      id: 'installation',
      name_en: 'Installation & Setup',
      name_fa: 'نصب و راه‌اندازی',
      description_en: 'Installation and setup procedures',
      description_fa: 'روش‌های نصب و راه‌اندازی',
      icon: 'Settings',
      color: 'purple',
      faq_count: 12
    },
    {
      id: 'orders',
      name_en: 'Orders & Shipping',
      name_fa: 'سفارشات و ارسال',
      description_en: 'Questions about ordering and delivery',
      description_fa: 'سؤالات درباره سفارش و تحویل',
      icon: 'Truck',
      color: 'red',
      faq_count: 14
    },
    {
      id: 'warranty',
      name_en: 'Warranty & Support',
      name_fa: 'گارانتی و پشتیبانی',
      description_en: 'Warranty terms and support information',
      description_fa: 'شرایط گارانتی و اطلاعات پشتیبانی',
      icon: 'Shield',
      color: 'teal',
      faq_count: 9
    }
  ];

  // Mock FAQ data
  const mockFaqs: FAQItem[] = [
    {
      id: 1,
      question_en: "How often should I clean my pool filter?",
      question_fa: "چند وقت یک‌بار باید فیلتر استخر را تمیز کنم؟",
      answer_en: "Pool filters should be cleaned every 2-4 weeks, depending on usage and environmental factors. Sand filters require backwashing, cartridge filters need rinsing and replacement every 3-6 months, and DE filters should be cleaned and recharged monthly.",
      answer_fa: "فیلترهای استخر باید هر ۲-۴ هفته یک‌بار تمیز شوند، بسته به میزان استفاده و عوامل محیطی. فیلترهای شنی نیاز به بک‌واش دارند، فیلترهای کارتریجی باید شسته شده و هر ۳-۶ ماه تعویض شوند، و فیلترهای DE باید ماهانه تمیز و شارژ شوند.",
      category: 'maintenance',
      tags: ['filter', 'cleaning', 'maintenance'],
      helpful_count: 45,
      not_helpful_count: 3,
      views: 1250,
      priority: 1,
      last_updated: '2024-01-15'
    },
    {
      id: 2,
      question_en: "What is the ideal pH level for pool water?",
      question_fa: "سطح pH مناسب برای آب استخر چقدر است؟",
      answer_en: "The ideal pH level for pool water is between 7.2 and 7.6. This range ensures optimal sanitizer effectiveness, swimmer comfort, and equipment protection. Test your water 2-3 times per week and adjust as needed using pH increasers or decreasers.",
      answer_fa: "سطح pH منا��ب برای آب استخر بین ۷.۲ تا ۷.۶ است. این محدوده اثربخشی مطلوب ضدعفونی‌کننده، راحتی شناگر و محافظت از تجهیزات را تضمین می‌کند. آب خود را ۲-۳ بار در هفته تست کنید و در صورت نیاز با استفاده از افزایش‌دهنده یا کاهش‌دهنده pH تنظیم کنید.",
      category: 'maintenance',
      tags: ['ph', 'water-chemistry', 'testing'],
      helpful_count: 67,
      not_helpful_count: 5,
      views: 1890,
      priority: 1,
      last_updated: '2024-01-10'
    },
    {
      id: 3,
      question_en: "How do I choose the right pool pump?",
      question_fa: "چگونه پمپ مناسب برای استخر انتخاب کنم؟",
      answer_en: "Choose a pool pump based on your pool size, plumbing system, and energy efficiency needs. Variable speed pumps are recommended for energy savings. Calculate the required flow rate (pool volume ÷ 8 hours) and ensure the pump can handle your pool's total dynamic head (TDH).",
      answer_fa: "پمپ استخر را بر اساس اندازه استخر، سیستم لوله‌کشی و نیازهای بهره‌وری انرژی انتخاب کنید. پمپ‌های با سرعت متغیر برای ��رفه‌جویی انرژی توصیه می‌شوند. نرخ جریان مورد نیاز (حجم استخر ÷ ۸ ساعت) را محاسبه کنید و اطمینان حاصل کنید که پمپ قادر به مدیریت کل ارتفاع دینامیکی (TDH) استخر شماست.",
      category: 'products',
      tags: ['pump', 'selection', 'sizing'],
      helpful_count: 89,
      not_helpful_count: 7,
      views: 2340,
      priority: 1,
      last_updated: '2024-01-08',
      video_url: 'https://youtube.com/watch?v=example'
    },
    {
      id: 4,
      question_en: "What's included in your warranty coverage?",
      question_fa: "پوشش گارانتی شما شامل چه مواردی است؟",
      answer_en: "Our warranty covers manufacturing defects and premature failure of equipment. Warranty periods vary by product (1-5 years). Coverage includes replacement parts and labor for authorized service centers. Normal wear, misuse, and environmental damage are not covered.",
      answer_fa: "گارانتی ما نقص‌های ساخت و خرابی زودرس تجهیزات را پوشش می‌دهد. دوره‌های گارانتی بر حسب محصول متفاوت است (۱-۵ سال). پوشش شامل قطعات یدکی و نیروی کار برای مراکز خد��ات مجاز است. فرسودگی طبیعی، سوء استفاده و آسیب‌های محیطی تحت پوشش نیست.",
      category: 'warranty',
      tags: ['warranty', 'coverage', 'terms'],
      helpful_count: 34,
      not_helpful_count: 2,
      views: 890,
      priority: 2,
      last_updated: '2024-01-12'
    },
    {
      id: 5,
      question_en: "How long does shipping take?",
      question_fa: "ارسال چقدر طول می‌کشد؟",
      answer_en: "Standard shipping takes 3-7 business days within Iran. Express shipping (1-3 days) is available for major cities. Heavy equipment may require additional time for freight delivery. You'll receive tracking information once your order ships.",
      answer_fa: "ارسال استاندارد ۳-۷ روز کاری در سراسر ایران طول می‌کشد. ارسال سریع (۱-۳ روز) برای شهرهای بزرگ موجود است. تجهیزات سنگین ممکن است به زمان اضافی برای تحویل باری نیاز داشته باشند. پس از ارسال سفارش، اطلاعات پیگیری دریافت خواهید کرد.",
      category: 'orders',
      tags: ['shipping', 'delivery', 'time'],
      helpful_count: 23,
      not_helpful_count: 1,
      views: 670,
      priority: 2,
      last_updated: '2024-01-14'
    },
    {
      id: 6,
      question_en: "Do you offer installation services?",
      question_fa: "آیا خدمات نصب ارائه می‌دهید؟",
      answer_en: "Yes, we offer professional installation services for most equipment through our certified partner network. Installation costs vary by product and location. Contact us for a quote and to schedule an appointment with a local installer.",
      answer_fa: "بله، ما خدمات نصب حرفه‌ای برای اکثر تجهیزات را از طریق شبکه شرکای تایید شده‌مان ارائه می‌دهیم. هزینه‌های نصب بر حسب محصول و مکان متفاوت است. برای دریافت قیمت و تعیین وقت با نصاب محلی با ما تماس بگیرید.",
      category: 'installation',
      tags: ['installation', 'service', 'professional'],
      helpful_count: 56,
      not_helpful_count: 4,
      views: 1120,
      priority: 2,
      last_updated: '2024-01-11'
    }
  ];

  useEffect(() => {
    setFaqs(mockFaqs);
    setCategories(mockCategories);
  }, []);

  // Filter FAQs based on search and category
  useEffect(() => {
    let filtered = [...faqs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => {
        const question = language === 'fa' ? faq.question_fa : faq.question_en;
        const answer = language === 'fa' ? faq.answer_fa : faq.answer_en;
        return question.toLowerCase().includes(term) ||
               answer.toLowerCase().includes(term) ||
               faq.tags.some(tag => tag.toLowerCase().includes(term));
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Sort by priority and helpful votes
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.helpful_count - a.helpful_count;
    });

    setFilteredFaqs(filtered);
  }, [faqs, searchTerm, selectedCategory, language]);

  const handleVote = (faqId: number, voteType: 'helpful' | 'not_helpful') => {
    const currentVote = userVotes[faqId];
    
    // If user already voted the same way, remove vote
    if (currentVote === voteType) {
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[faqId];
        return newVotes;
      });
      
      setFaqs(prev => prev.map(faq => {
        if (faq.id === faqId) {
          return {
            ...faq,
            [voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count']: 
              faq[voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count'] - 1
          };
        }
        return faq;
      }));
    } else {
      // Update vote
      setUserVotes(prev => ({ ...prev, [faqId]: voteType }));
      
      setFaqs(prev => prev.map(faq => {
        if (faq.id === faqId) {
          const updates: any = {
            [voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count']: 
              faq[voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count'] + 1
          };
          
          // If user previously voted differently, decrease that count
          if (currentVote) {
            updates[currentVote === 'helpful' ? 'helpful_count' : 'not_helpful_count'] = 
              faq[currentVote === 'helpful' ? 'helpful_count' : 'not_helpful_count'] - 1;
          }
          
          return { ...faq, ...updates };
        }
        return faq;
      }));
    }
  };

  const toggleExpanded = (faqId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
        // Update view count when expanding
        setFaqs(prevFaqs => prevFaqs.map(faq => 
          faq.id === faqId ? { ...faq, views: faq.views + 1 } : faq
        ));
      }
      return newSet;
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const icons = {
      'HelpCircle': HelpCircle,
      'Package': FileText,
      'Wrench': Wrench,
      'Settings': Settings,
      'Truck': Truck,
      'Shield': Shield
    };
    return icons[iconName as keyof typeof icons] || HelpCircle;
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const FAQItem = ({ faq }: { faq: FAQItem }) => {
    const question = language === 'fa' ? faq.question_fa : faq.question_en;
    const answer = language === 'fa' ? faq.answer_fa : faq.answer_en;
    const isExpanded = expandedItems.has(faq.id);
    const userVote = userVotes[faq.id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div
          className="p-6 cursor-pointer"
          onClick={() => toggleExpanded(faq.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {question}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{faq.helpful_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{faq.views} {language === 'fa' ? 'بازدید' : 'views'}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {faq.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="ml-4">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t bg-gray-50"
            >
              <div className="p-6 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{answer}</p>
                </div>

                {faq.video_url && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{language === 'fa' ? 'ویدیو آموزشی موجود' : 'Tutorial video available'}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                      {language === 'fa' ? 'آیا این پاسخ مفید بود؟' : 'Was this answer helpful?'}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(faq.id, 'helpful');
                        }}
                        className={`${userVote === 'helpful' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {language === 'fa' ? 'مفید' : 'Yes'} ({faq.helpful_count})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(faq.id, 'not_helpful');
                        }}
                        className={`${userVote === 'not_helpful' ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        {language === 'fa' ? 'غیرمفید' : 'No'} ({faq.not_helpful_count})
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {language === 'fa' ? 'آخرین بروزرسانی:' : 'Last updated:'} {faq.last_updated}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'fa' ? 'سؤالات متداول' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'fa' 
              ? 'پاسخ سؤالات رایج در مورد محصولات و خدمات ما را اینجا بیابید'
              : 'Find answers to common questions about our products and services'
            }
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                placeholder={language === 'fa' ? 'جستجو در سؤالات...' : 'Search questions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} h-14 text-lg border-2 focus:border-blue-500`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>{language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory('all')}
                  className="w-full justify-start"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'همه' : 'All'} ({faqs.length})
                </Button>
                
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="flex-1 text-left">
                        {language === 'fa' ? category.name_fa : category.name_en}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {category.faq_count}
                      </Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'fa' ? 'نیاز به کمک بیشتر؟' : 'Need More Help?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'چت آنلاین' : 'Live Chat'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'تماس تلفنی' : 'Phone Support'}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'ارسال ایمیل' : 'Email Support'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {language === 'fa' 
                  ? `${filteredFaqs.length} سؤال یافت شد`
                  : `${filteredFaqs.length} questions found`
                }
                {selectedCategory !== 'all' && (
                  <span className="ml-2">
                    {language === 'fa' ? 'در دسته' : 'in'} "
                    {language === 'fa' 
                      ? categories.find(c => c.id === selectedCategory)?.name_fa
                      : categories.find(c => c.id === selectedCategory)?.name_en
                    }"
                  </span>
                )}
              </p>
              
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  {language === 'fa' ? 'پاک کردن فیلترها' : 'Clear Filters'}
                </Button>
              )}
            </div>

            {/* FAQ List */}
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'fa' ? 'سؤالی یافت نشد' : 'No questions found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'fa' 
                    ? 'لطفاً کلمات کلیدی دیگری امتحان کنید یا با پشتیبانی تماس بگیرید'
                    : 'Try different keywords or contact our support team'
                  }
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'چت با پشتیبانی' : 'Chat with Support'}
                  </Button>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'ارسال سؤال جدید' : 'Ask New Question'}
                  </Button>
                </div>
              </div>
            )}

            {/* Popular Questions */}
            {searchTerm === '' && selectedCategory === 'all' && (
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>
                    {language === 'fa' ? 'پرسیده‌ترین سؤالات' : 'Most Popular Questions'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'fa' 
                      ? 'سؤالاتی که بیشتر از همه پرسیده می‌شوند'
                      : 'Questions that are asked most frequently'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faqs
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((faq, index) => {
                        const question = language === 'fa' ? faq.question_fa : faq.question_en;
                        return (
                          <div 
                            key={faq.id}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => toggleExpanded(faq.id)}
                          >
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {question}
                              </p>
                              <p className="text-xs text-gray-500">
                                {faq.views} {language === 'fa' ? 'بازدید' : 'views'} • 
                                {faq.helpful_count} {language === 'fa' ? 'مفید' : 'helpful'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
