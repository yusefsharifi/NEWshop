import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, User, Eye, Heart, Share2, Clock, 
  Tag, BookOpen, TrendingUp, Filter, ChevronRight, 
  Play, FileText, Video, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: number;
  title_en: string;
  title_fa: string;
  summary_en: string;
  summary_fa: string;
  content_en: string;
  content_fa: string;
  featured_image: string;
  gallery?: string[];
  video_url?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio_en: string;
    bio_fa: string;
  };
  published_date: string;
  updated_date?: string;
  reading_time: number;
  views: number;
  likes: number;
  shares: number;
  is_featured: boolean;
  is_trending: boolean;
  type: 'article' | 'video' | 'guide' | 'news';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  seo: {
    meta_description_en: string;
    meta_description_fa: string;
    keywords: string[];
  };
}

interface BlogCategory {
  id: string;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  post_count: number;
  color: string;
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, dir } = useLanguage();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const postsPerPage = 12;

  // Mock blog data
  const mockCategories: BlogCategory[] = [
    {
      id: 'maintenance',
      name_en: 'Pool Maintenance',
      name_fa: 'نگهداری استخر',
      description_en: 'Tips and guides for pool maintenance',
      description_fa: 'راهنما و نکات نگهداری استخر',
      post_count: 25,
      color: 'blue'
    },
    {
      id: 'equipment',
      name_en: 'Equipment Reviews',
      name_fa: 'بررسی تجهیزات',
      description_en: 'Reviews and comparisons of pool equipment',
      description_fa: 'بررسی و مقایسه تجهیزات استخر',
      post_count: 18,
      color: 'green'
    },
    {
      id: 'water-chemistry',
      name_en: 'Water Chemistry',
      name_fa: 'شیمی آب',
      description_en: 'Understanding and managing pool water chemistry',
      description_fa: 'درک و مدیریت شیمی آب استخر',
      post_count: 22,
      color: 'purple'
    },
    {
      id: 'troubleshooting',
      name_en: 'Troubleshooting',
      name_fa: 'عیب‌یابی',
      description_en: 'Solutions to common pool problems',
      description_fa: 'راه‌حل مشکلات رایج استخر',
      post_count: 15,
      color: 'red'
    },
    {
      id: 'seasonal',
      name_en: 'Seasonal Care',
      name_fa: 'مراقبت فصلی',
      description_en: 'Seasonal pool care and preparation',
      description_fa: 'مراقبت و آماده‌سازی فصلی استخر',
      post_count: 12,
      color: 'orange'
    }
  ];

  const mockPosts: BlogPost[] = [
    {
      id: 1,
      title_en: "Complete Guide to Pool Water Chemistry",
      title_fa: "راهنمای کامل شیمی آب استخر",
      summary_en: "Learn everything about maintaining proper water chemistry for crystal clear and safe pool water.",
      summary_fa: "همه چیز درباره حفظ شیمی مناسب آب برای داشتن آب استخر شفاف و ایمن یاد بگیرید.",
      content_en: "Pool water chemistry is crucial...",
      content_fa: "شیمی آب استخر بسیار مهم است...",
      featured_image: "/placeholder.svg",
      category: "water-chemistry",
      tags: ["pH", "chlorine", "alkalinity", "water-testing"],
      author: {
        name: "احمد محمدی",
        avatar: "/placeholder.svg",
        bio_en: "Pool maintenance expert with 15 years experience",
        bio_fa: "متخصص نگهداری استخر با ۱۵ سال تجربه"
      },
      published_date: "2024-01-15",
      reading_time: 8,
      views: 1250,
      likes: 89,
      shares: 34,
      is_featured: true,
      is_trending: true,
      type: "guide",
      difficulty: "intermediate",
      seo: {
        meta_description_en: "Complete guide to pool water chemistry",
        meta_description_fa: "راهنمای کامل شیمی آب استخر",
        keywords: ["pool", "water", "chemistry", "pH", "chlorine"]
      }
    },
    {
      id: 2,
      title_en: "Best Pool Pumps for 2024: Complete Review",
      title_fa: "بهترین پمپ‌های استخر ۲۰۲۴: بررسی کامل",
      summary_en: "Comprehensive review of the top pool pumps available in 2024, including variable speed and energy-efficient models.",
      summary_fa: "بررسی جامع بهترین پمپ‌های استخر موجود در ۲۰۲۴، شامل مدل‌های با سرعت متغیر و انرژی‌کارآمد.",
      content_en: "When choosing a pool pump...",
      content_fa: "هنگام انتخاب پمپ استخر...",
      featured_image: "/placeholder.svg",
      video_url: "https://youtube.com/watch?v=example",
      category: "equipment",
      tags: ["pumps", "reviews", "energy-efficient", "variable-speed"],
      author: {
        name: "سارا احمدی",
        avatar: "/placeholder.svg",
        bio_en: "Pool equipment specialist and technical writer",
        bio_fa: "متخصص تجهیزات استخر و نویسنده فنی"
      },
      published_date: "2024-01-10",
      reading_time: 12,
      views: 2100,
      likes: 156,
      shares: 67,
      is_featured: true,
      is_trending: false,
      type: "video",
      difficulty: "beginner",
      seo: {
        meta_description_en: "Best pool pumps review for 2024",
        meta_description_fa: "بررسی بهترین پمپ‌های استخر ۲۰۲۴",
        keywords: ["pool pumps", "review", "2024", "variable speed"]
      }
    },
    {
      id: 3,
      title_en: "How to Winterize Your Pool: Step-by-Step Guide",
      title_fa: "نحوه زمستان‌سازی استخر: راهنمای گام به گام",
      summary_en: "Protect your pool during winter months with this comprehensive winterization guide.",
      summary_fa: "با این راهنمای جامع زمستان‌سازی، استخر خود را در ماه‌های زمستان محافظت کنید.",
      content_en: "Winterizing your pool is essential...",
      content_fa: "زمستان‌سازی استخر ضروری است...",
      featured_image: "/placeholder.svg",
      gallery: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      category: "seasonal",
      tags: ["winterization", "seasonal-care", "pool-protection"],
      author: {
        name: "علی رضایی",
        avatar: "/placeholder.svg",
        bio_en: "Seasonal pool care expert",
        bio_fa: "متخصص مراقبت فصلی استخر"
      },
      published_date: "2024-01-05",
      reading_time: 6,
      views: 980,
      likes: 72,
      shares: 28,
      is_featured: false,
      is_trending: true,
      type: "guide",
      difficulty: "intermediate",
      seo: {
        meta_description_en: "Complete pool winterization guide",
        meta_description_fa: "راهنمای کامل زمستان‌سازی استخر",
        keywords: ["pool", "winterization", "seasonal care", "protection"]
      }
    },
    {
      id: 4,
      title_en: "Common Pool Problems and Quick Fixes",
      title_fa: "مشکلات رایج استخر و راه‌حل‌های سریع",
      summary_en: "Quick solutions to the most common pool problems every pool owner faces.",
      summary_fa: "راه‌حل‌های سریع برای رایج‌ترین مشکلات استخری که هر صاحب استخر با آن مواجه می‌شود.",
      content_en: "Pool problems can be frustrating...",
      content_fa: "مشکلات استخر می‌تواند ناامیدکننده باشد...",
      featured_image: "/placeholder.svg",
      category: "troubleshooting",
      tags: ["troubleshooting", "quick-fixes", "common-problems"],
      author: {
        name: "مریم کریمی",
        avatar: "/placeholder.svg",
        bio_en: "Pool troubleshooting specialist",
        bio_fa: "متخصص عیب‌یابی استخر"
      },
      published_date: "2023-12-28",
      reading_time: 5,
      views: 1560,
      likes: 234,
      shares: 89,
      is_featured: false,
      is_trending: false,
      type: "article",
      difficulty: "beginner",
      seo: {
        meta_description_en: "Quick fixes for common pool problems",
        meta_description_fa: "راه‌حل‌های سریع مشکلات رایج استخر",
        keywords: ["pool problems", "troubleshooting", "quick fixes"]
      }
    }
  ];

  useEffect(() => {
    setPosts(mockPosts);
    setCategories(mockCategories);
  }, []);

  // Filter and search posts
  useEffect(() => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title_en.toLowerCase().includes(term) ||
        post.title_fa.toLowerCase().includes(term) ||
        post.summary_en.toLowerCase().includes(term) ||
        post.summary_fa.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(post => post.type === selectedType);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
        case 'oldest':
          return new Date(a.published_date).getTime() - new Date(b.published_date).getTime();
        case 'popular':
          return b.views - a.views;
        case 'liked':
          return b.likes - a.likes;
        case 'reading_time':
          return a.reading_time - b.reading_time;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, searchTerm, selectedCategory, selectedType, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedType, sortBy, setSearchParams]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'guide': return BookOpen;
      case 'news': return FileText;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      fa: {
        article: 'مقاله',
        video: 'ویدیو',
        guide: 'راهنما',
        news: 'خبر'
      },
      en: {
        article: 'Article',
        video: 'Video',
        guide: 'Guide',
        news: 'News'
      }
    };
    return labels[language][type as keyof typeof labels.fa] || type;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      fa: {
        beginner: 'مبتدی',
        intermediate: 'متوسط',
        advanced: 'پیشرفته'
      },
      en: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
    };
    return labels[language][difficulty as keyof typeof labels.fa] || difficulty;
  };

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const PostCard = ({ post }: { post: BlogPost }) => {
    const title = language === 'fa' ? post.title_fa : post.title_en;
    const summary = language === 'fa' ? post.summary_fa : post.summary_en;
    const TypeIcon = getTypeIcon(post.type);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={post.featured_image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {post.is_featured && (
              <Badge className="bg-yellow-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'ویژه' : 'Featured'}
              </Badge>
            )}
            {post.is_trending && (
              <Badge className="bg-red-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'ترند' : 'Trending'}
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90">
              <TypeIcon className="w-3 h-3 mr-1" />
              {getTypeLabel(post.type)}
            </Badge>
          </div>

          {/* Video Play Button */}
          {post.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Reading Time */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/50 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {post.reading_time} {language === 'fa' ? 'دقیقه' : 'min'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Category & Difficulty */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {language === 'fa' 
                ? categories.find(c => c.id === post.category)?.name_fa
                : categories.find(c => c.id === post.category)?.name_en
              }
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(post.difficulty)}`}>
              {getDifficultyLabel(post.difficulty)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            <Link to={`/blog/${post.id}`}>
              {title}
            </Link>
          </h3>

          {/* Summary */}
          <p className="text-gray-600 line-clamp-3 text-sm">
            {summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Author & Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                <p className="text-xs text-gray-500">{formatDate(post.published_date)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Button asChild className="flex-1">
              <Link to={`/blog/${post.id}`}>
                {language === 'fa' ? 'ادامه مطلب' : 'Read More'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'fa' ? 'بلاگ آکواپرو' : 'AquaPro Blog'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'fa' 
              ? 'راهنماها، نکات و آخرین اخبار دنیای استخر'
              : 'Guides, tips, and latest news from the pool world'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={language === 'fa' ? 'جستجو در مقالات...' : 'Search articles...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-40">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'fa' ? 'دسته‌بندی' : 'Category'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === 'fa' ? 'همه دسته‌ها' : 'All Categories'}
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {language === 'fa' ? category.name_fa : category.name_en} ({category.post_count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-40">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'fa' ? 'نوع محتوا' : 'Content Type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه انواع' : 'All Types'}</SelectItem>
                      <SelectItem value="article">{getTypeLabel('article')}</SelectItem>
                      <SelectItem value="video">{getTypeLabel('video')}</SelectItem>
                      <SelectItem value="guide">{getTypeLabel('guide')}</SelectItem>
                      <SelectItem value="news">{getTypeLabel('news')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-40">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{language === 'fa' ? 'جدیدترین' : 'Newest'}</SelectItem>
                      <SelectItem value="oldest">{language === 'fa' ? 'قدیمی‌ترین' : 'Oldest'}</SelectItem>
                      <SelectItem value="popular">{language === 'fa' ? 'محبوب‌ترین' : 'Most Popular'}</SelectItem>
                      <SelectItem value="liked">{language === 'fa' ? 'پسندیده‌تر��ن' : 'Most Liked'}</SelectItem>
                      <SelectItem value="reading_time">{language === 'fa' ? 'سریع‌ترین خواندن' : 'Quick Read'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {language === 'fa' 
                    ? `${filteredPosts.length} مقاله یافت شد`
                    : `${filteredPosts.length} articles found`
                  }
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current"></div>
                      <div className="bg-current"></div>
                      <div className="bg-current"></div>
                      <div className="bg-current"></div>
                    </div>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <div className="w-4 h-4 flex flex-col space-y-1">
                      <div className="h-0.5 bg-current"></div>
                      <div className="h-0.5 bg-current"></div>
                      <div className="h-0.5 bg-current"></div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Posts */}
        {currentPage === 1 && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'fa' ? 'مقالات ویژه' : 'Featured Articles'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.filter(post => post.is_featured).slice(0, 2).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="space-y-6">
          {paginatedPosts.length > 0 ? (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  {paginatedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'fa' ? 'مقاله‌ا�� یافت نشد' : 'No articles found'}
              </h3>
              <p className="text-gray-600">
                {language === 'fa' 
                  ? 'لطفاً کلمات کلیدی دیگری امتحان کنید یا فیلترها را تغییر دهید'
                  : 'Try different keywords or adjust your filters'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
