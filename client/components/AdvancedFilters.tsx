import { useState, useEffect } from 'react';
import { 
  Filter, X, ChevronDown, ChevronUp, Sliders, Tag, 
  Star, Package, DollarSign, Calendar, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
  id: string;
  label: string;
  count: number;
  checked: boolean;
}

interface FilterCategory {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'rating';
  options?: FilterOption[];
  min?: number;
  max?: number;
  value?: any;
  selectOptions?: Array<{ value: string; label: string }>;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  totalResults: number;
  isLoading?: boolean;
}

export default function AdvancedFilters({ onFiltersChange, totalResults, isLoading }: AdvancedFiltersProps) {
  const { language, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);
  
  // Mock filter categories
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>([
    {
      id: 'brands',
      name: language === 'fa' ? 'برند' : 'Brand',
      type: 'checkbox',
      options: [
        { id: 'pentair', label: 'Pentair', count: 15, checked: false },
        { id: 'hayward', label: 'Hayward', count: 12, checked: false },
        { id: 'jandy', label: 'Jandy', count: 8, checked: false },
        { id: 'aquapro', label: 'AquaPro', count: 20, checked: false },
        { id: 'waterway', label: 'Waterway', count: 6, checked: false }
      ]
    },
    {
      id: 'categories',
      name: language === 'fa' ? 'دسته‌بندی' : 'Category',
      type: 'checkbox',
      options: [
        { id: 'pumps', label: language === 'fa' ? 'پمپ‌ها' : 'Pumps', count: 25, checked: false },
        { id: 'filters', label: language === 'fa' ? 'فیلترها' : 'Filters', count: 18, checked: false },
        { id: 'heaters', label: language === 'fa' ? 'هیترها' : 'Heaters', count: 12, checked: false },
        { id: 'lights', label: language === 'fa' ? 'چراغ‌ها' : 'Lights', count: 15, checked: false },
        { id: 'chemicals', label: language === 'fa' ? 'مواد شیمیایی' : 'Chemicals', count: 30, checked: false },
        { id: 'accessories', label: language === 'fa' ? 'لوازم جانبی' : 'Accessories', count: 22, checked: false }
      ]
    },
    {
      id: 'features',
      name: language === 'fa' ? 'ویژگی‌ها' : 'Features',
      type: 'checkbox',
      options: [
        { id: 'energy_efficient', label: language === 'fa' ? 'کم مصرف' : 'Energy Efficient', count: 35, checked: false },
        { id: 'variable_speed', label: language === 'fa' ? 'سرعت متغیر' : 'Variable Speed', count: 18, checked: false },
        { id: 'self_priming', label: language === 'fa' ? 'خودمکش' : 'Self-Priming', count: 22, checked: false },
        { id: 'corrosion_resistant', label: language === 'fa' ? 'ضد خوردگی' : 'Corrosion Resistant', count: 28, checked: false },
        { id: 'digital_display', label: language === 'fa' ? 'نمایشگر دیجیتال' : 'Digital Display', count: 12, checked: false },
        { id: 'remote_control', label: language === 'fa' ? 'کنترل از راه دور' : 'Remote Control', count: 15, checked: false }
      ]
    },
    {
      id: 'power',
      name: language === 'fa' ? 'قدرت موتور' : 'Motor Power',
      type: 'select',
      selectOptions: [
        { value: 'all', label: language === 'fa' ? 'همه' : 'All' },
        { value: '0.5hp', label: '0.5 HP' },
        { value: '0.75hp', label: '0.75 HP' },
        { value: '1hp', label: '1 HP' },
        { value: '1.5hp', label: '1.5 HP' },
        { value: '2hp', label: '2 HP' },
        { value: '3hp', label: '3 HP' }
      ]
    },
    {
      id: 'warranty',
      name: language === 'fa' ? 'مدت گارانتی' : 'Warranty Period',
      type: 'select',
      selectOptions: [
        { value: 'all', label: language === 'fa' ? 'همه' : 'All' },
        { value: '1year', label: language === 'fa' ? '۱ سال' : '1 Year' },
        { value: '2years', label: language === 'fa' ? '۲ سال' : '2 Years' },
        { value: '3years', label: language === 'fa' ? '۳ سال' : '3 Years' },
        { value: '5years', label: language === 'fa' ? '۵ سال' : '5 Years' }
      ]
    }
  ]);

  const [activeFilters, setActiveFilters] = useState<any>({});

  const handleFilterChange = (categoryId: string, optionId: string, checked: boolean) => {
    setFilterCategories(prev => prev.map(category => {
      if (category.id === categoryId && category.options) {
        return {
          ...category,
          options: category.options.map(option =>
            option.id === optionId ? { ...option, checked } : option
          )
        };
      }
      return category;
    }));

    // Update active filters
    setActiveFilters((prev: any) => {
      const newFilters = { ...prev };
      if (!newFilters[categoryId]) newFilters[categoryId] = [];
      
      if (checked) {
        newFilters[categoryId] = [...newFilters[categoryId], optionId];
      } else {
        newFilters[categoryId] = newFilters[categoryId].filter((id: string) => id !== optionId);
      }
      
      if (newFilters[categoryId].length === 0) {
        delete newFilters[categoryId];
      }
      
      return newFilters;
    });
  };

  const handleSelectChange = (categoryId: string, value: string) => {
    setActiveFilters((prev: any) => ({
      ...prev,
      [categoryId]: value !== 'all' ? value : undefined
    }));
  };

  const clearAllFilters = () => {
    setFilterCategories(prev => prev.map(category => ({
      ...category,
      options: category.options?.map(option => ({ ...option, checked: false }))
    })));
    setActiveFilters({});
    setPriceRange([0, 10000000]);
    setSelectedRating(0);
    setShowOnlyInStock(false);
    setShowOnlyDiscounted(false);
    setSearchTerm('');
  };

  const clearFilter = (categoryId: string, optionId?: string) => {
    if (optionId) {
      handleFilterChange(categoryId, optionId, false);
    } else {
      // Clear entire category
      setFilterCategories(prev => prev.map(category => {
        if (category.id === categoryId && category.options) {
          return {
            ...category,
            options: category.options.map(option => ({ ...option, checked: false }))
          };
        }
        return category;
      }));
      
      setActiveFilters((prev: any) => {
        const newFilters = { ...prev };
        delete newFilters[categoryId];
        return newFilters;
      });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.values(activeFilters).forEach(filterValue => {
      if (Array.isArray(filterValue)) {
        count += filterValue.length;
      } else if (filterValue) {
        count += 1;
      }
    });
    
    if (priceRange[0] > 0 || priceRange[1] < 10000000) count++;
    if (selectedRating > 0) count++;
    if (showOnlyInStock) count++;
    if (showOnlyDiscounted) count++;
    if (searchTerm.trim()) count++;
    
    return count;
  };

  // Apply filters
  useEffect(() => {
    const filters = {
      ...activeFilters,
      priceRange: priceRange[0] > 0 || priceRange[1] < 10000000 ? priceRange : undefined,
      rating: selectedRating > 0 ? selectedRating : undefined,
      inStock: showOnlyInStock || undefined,
      discounted: showOnlyDiscounted || undefined,
      search: searchTerm.trim() || undefined,
      sortBy
    };

    onFiltersChange(filters);
  }, [activeFilters, priceRange, selectedRating, showOnlyInStock, showOnlyDiscounted, searchTerm, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4" dir={dir}>
      {/* Quick Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'fa' ? 'جستجو در محصولات...' : 'Search products...'}
              className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>{language === 'fa' ? 'فیلترها' : 'Filters'}</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        <div className="flex items-center space-x-2">
          <Label className="text-sm">{language === 'fa' ? 'مرتب‌سازی:' : 'Sort by:'}</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{language === 'fa' ? 'جدیدترین' : 'Newest'}</SelectItem>
              <SelectItem value="oldest">{language === 'fa' ? 'قدیمی‌ترین' : 'Oldest'}</SelectItem>
              <SelectItem value="price_low">{language === 'fa' ? 'ارزان‌ترین' : 'Price: Low to High'}</SelectItem>
              <SelectItem value="price_high">{language === 'fa' ? 'گران‌ترین' : 'Price: High to Low'}</SelectItem>
              <SelectItem value="popularity">{language === 'fa' ? 'محبوب‌ترین' : 'Most Popular'}</SelectItem>
              <SelectItem value="rating">{language === 'fa' ? 'بالاترین امتیاز' : 'Highest Rated'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {language === 'fa' 
            ? `${totalResults} محصول یافت شد`
            : `${totalResults} products found`
          }
        </span>
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            {language === 'fa' ? 'پاک کردن همه' : 'Clear All'}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([categoryId, filterValue]) => {
                const category = filterCategories.find(c => c.id === categoryId);
                if (!category) return null;

                if (Array.isArray(filterValue)) {
                  return filterValue.map((optionId: string) => {
                    const option = category.options?.find(o => o.id === optionId);
                    if (!option) return null;
                    
                    return (
                      <Badge
                        key={`${categoryId}-${optionId}`}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{option.label}</span>
                        <button
                          onClick={() => clearFilter(categoryId, optionId)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  });
                } else {
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{filterValue}</span>
                      <button
                        onClick={() => clearFilter(categoryId)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                }
              })}

              {/* Price Range Badge */}
              {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </span>
                  <button
                    onClick={() => setPriceRange([0, 10000000])}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Rating Badge */}
              {selectedRating > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{selectedRating} ⭐ {language === 'fa' ? 'و بالاتر' : '& up'}</span>
                  <button
                    onClick={() => setSelectedRating(0)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5" />
                  <span>{language === 'fa' ? 'فیلترهای پیشرفته' : 'Advanced Filters'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium flex items-center space-x-2 mb-3">
                    <DollarSign className="w-4 h-4" />
                    <span>{language === 'fa' ? 'محدوده قیمت' : 'Price Range'}</span>
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating Filter */}
                <div>
                  <Label className="text-base font-medium flex items-center space-x-2 mb-3">
                    <Star className="w-4 h-4" />
                    <span>{language === 'fa' ? 'حداقل امتیاز' : 'Minimum Rating'}</span>
                  </Label>
                  {renderStars(selectedRating)}
                </div>

                <Separator />

                {/* Quick Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>{language === 'fa' ? 'فقط موجود در انبار' : 'In Stock Only'}</span>
                    </Label>
                    <Switch checked={showOnlyInStock} onCheckedChange={setShowOnlyInStock} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <span>{language === 'fa' ? 'فقط تخفیف‌دار' : 'On Sale Only'}</span>
                    </Label>
                    <Switch checked={showOnlyDiscounted} onCheckedChange={setShowOnlyDiscounted} />
                  </div>
                </div>

                <Separator />

                {/* Filter Categories */}
                <Accordion type="multiple" className="w-full">
                  {filterCategories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="text-base font-medium">
                        <div className="flex items-center justify-between w-full mr-2">
                          <span>{category.name}</span>
                          {activeFilters[category.id] && (
                            <Badge variant="secondary" className="ml-2">
                              {Array.isArray(activeFilters[category.id]) 
                                ? activeFilters[category.id].length 
                                : 1
                              }
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {category.type === 'checkbox' && category.options && (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {category.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option.id}
                                  checked={option.checked}
                                  onCheckedChange={(checked) => 
                                    handleFilterChange(category.id, option.id, checked as boolean)
                                  }
                                />
                                <Label 
                                  htmlFor={option.id} 
                                  className="flex-1 flex items-center justify-between cursor-pointer"
                                >
                                  <span>{option.label}</span>
                                  <span className="text-sm text-gray-500">({option.count})</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {category.type === 'select' && category.selectOptions && (
                          <Select 
                            value={activeFilters[category.id] || 'all'} 
                            onValueChange={(value) => handleSelectChange(category.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {category.selectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
