import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  Star, 
  Grid, 
  List, 
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearch } from '@/hooks/useSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, dir, language } = useLanguage();
  const { addItem } = useCart();
  const isMobile = useIsMobile();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const {
    query,
    setQuery,
    products,
    suggestions,
    isLoading,
    filters,
    updateFilters,
    clearFilters,
    filterOptions,
    totalResults
  } = useSearch();

  // Initialize search from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams, setQuery]);

  // Update URL when query changes
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  }, [query, setSearchParams]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_fa: product.name_fa,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: 50 // Default stock
    });
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        const nameA = language === 'fa' ? a.name_fa : a.name_en;
        const nameB = language === 'fa' ? b.name_fa : b.name_en;
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const filterVariants = {
    hidden: { x: dir === 'rtl' ? 300 : -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      x: dir === 'rtl' ? 300 : -300, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {language === 'fa' ? 'جستجو در محصولات' : 'Search Products'}
          </h1>
          
          {/* Enhanced Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative">
              <SearchIcon className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={language === 'fa' ? 'جستجوی محصولات...' : 'Search products...'}
                className={`${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-lg`}
              />
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuery('')}
                  className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      onClick={() => {
                        setQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <SearchIcon className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(isFilterOpen || !isMobile) && (
              <motion.div
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden lg:block'} lg:w-80`}
              >
                <div className={`${isFilterOpen ? 'absolute right-0 top-0 h-full w-80 bg-white shadow-2xl' : ''} lg:relative lg:shadow-none`}>
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full lg:h-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <SlidersHorizontal className="w-5 h-5 mr-2" />
                          {language === 'fa' ? 'فیلترها' : 'Filters'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {language === 'fa' ? 'پاک کردن' : 'Clear'}
                          </Button>
                          {isFilterOpen && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsFilterOpen(false)}
                              className="lg:hidden"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Category Filter */}
                        {filterOptions && filterOptions.categories && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            {language === 'fa' ? 'دسته‌بندی' : 'Category'}
                          </Label>
                          <Select value={filters.category || ''} onValueChange={(value) => updateFilters({ category: value || '' })}>
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'fa' ? 'انتخاب دسته‌بندی' : 'Select category'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">
                                {language === 'fa' ? 'همه دسته‌ها' : 'All categories'}
                              </SelectItem>
                              {filterOptions.categories
                                .filter(category => category && typeof category === 'string' && category.trim() !== '')
                                .map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        )}

                        {/* Brand Filter */}
                        {filterOptions && filterOptions.brands && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            {language === 'fa' ? 'برند' : 'Brand'}
                          </Label>
                          <Select value={filters.brand || ''} onValueChange={(value) => updateFilters({ brand: value || '' })}>
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'fa' ? 'انتخاب برند' : 'Select brand'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">
                                {language === 'fa' ? 'همه برندها' : 'All brands'}
                              </SelectItem>
                              {filterOptions.brands
                                .filter(brand => brand && typeof brand === 'string' && brand.trim() !== '')
                                .map(brand => (
                                  <SelectItem key={brand} value={brand}>
                                    {brand}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        )}

                        {/* Price Range */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            {language === 'fa' ? 'محدوده قیمت' : 'Price Range'}
                          </Label>
                          <div className="space-y-4">
                            <Slider
                              value={[filters.minPrice, filters.maxPrice]}
                              onValueChange={([min, max]) => updateFilters({ minPrice: min, maxPrice: max })}
                              min={0}
                              max={5000}
                              step={50}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>${filters.minPrice}</span>
                              <span>${filters.maxPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            {language === 'fa' ? 'امتیاز' : 'Rating'}
                          </Label>
                          <div className="space-y-2">
                            {[4, 3, 2, 1].map(rating => (
                              <motion.button
                                key={rating}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateFilters({ rating: filters.rating === rating ? 0 : rating })}
                                className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                  filters.rating === rating ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-700">
                                  {language === 'fa' ? 'و بالاتر' : '& Up'}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Bestsellers */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bestsellers"
                            checked={filters.bestsellers}
                            onCheckedChange={(checked) => updateFilters({ bestsellers: !!checked })}
                          />
                          <Label htmlFor="bestsellers" className="text-sm font-medium text-gray-700">
                            {language === 'fa' ? 'فقط پرفروش‌ترین‌ها' : 'Bestsellers only'}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading
                    ? (language === 'fa' ? 'در حال جستجو...' : 'Searching...')
                    : query
                      ? (language === 'fa' 
                          ? `${totalResults} نتیجه برای "${query}"`
                          : `${totalResults} results for "${query}"`)
                      : (language === 'fa' 
                          ? `${totalResults} محصول یافت شد`
                          : `${totalResults} products found`)
                  }
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy || 'relevance'} onValueChange={(value) => setSortBy(value || 'relevance')}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">
                      {language === 'fa' ? 'مرتبط‌ترین' : 'Most Relevant'}
                    </SelectItem>
                    <SelectItem value="price-low">
                      {language === 'fa' ? 'قیمت: کم به زیاد' : 'Price: Low to High'}
                    </SelectItem>
                    <SelectItem value="price-high">
                      {language === 'fa' ? 'قیمت: زیاد به کم' : 'Price: High to Low'}
                    </SelectItem>
                    <SelectItem value="rating">
                      {language === 'fa' ? 'بالاترین امتیاز' : 'Highest Rated'}
                    </SelectItem>
                    <SelectItem value="name">
                      {language === 'fa' ? 'الفبایی' : 'Alphabetical'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {language === 'fa' ? 'فیلتر' : 'Filter'}
                </Button>
              </div>
            </motion.div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 overflow-hidden">
                    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'fa' ? 'نتیجه‌ای یافت نشد' : 'No results found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'fa'
                    ? 'لطفاً کلمات کلیدی دیگری امتحان کنید'
                    : 'Try different keywords or adjust your filters'
                  }
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }
              >
                {sortedProducts.map((product) => {
                  const productName = language === 'fa' ? product.name_fa : product.name_en;
                  const categoryName = language === 'fa' ? product.category_name_fa : product.category_name_en;
                  
                  return (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                          <Link to={`/product/${product.id}`}>
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={product.image_url}
                              alt={productName}
                              className={`w-full object-cover transition-transform duration-300 ${
                                viewMode === 'list' ? 'h-full' : 'h-48'
                              }`}
                            />
                          </Link>
                          
                          <div className="absolute top-3 left-3 space-y-1">
                            {product.is_bestseller && (
                              <Badge className="bg-yellow-500 text-white">
                                {language === 'fa' ? 'پرفروش' : 'Bestseller'}
                              </Badge>
                            )}
                          </div>

                          <div className="absolute top-3 right-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                            >
                              <Heart className="w-4 h-4 text-gray-600" />
                            </motion.button>
                          </div>
                        </div>

                        <CardContent className={`${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''} p-4`}>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {categoryName}
                              </Badge>
                              <span className="text-xs text-gray-500">{product.brand}</span>
                            </div>

                            <Link to={`/product/${product.id}`}>
                              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                                {productName}
                              </h3>
                            </Link>

                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">
                                ({product.rating})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-gray-900">
                                ${product.price}
                              </span>
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                {language === 'fa' ? 'افزودن' : 'Add'}
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
