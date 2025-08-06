import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  price: number;
  category_name_en?: string;
  category_name_fa?: string;
  brand: string;
  image_url: string;
  rating: number;
  is_bestseller: boolean;
}

interface SearchFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  rating: number;
  bestsellers: boolean;
}

export function useSearch() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    brand: '',
    rating: 0,
    bestsellers: false
  });

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    
    products.forEach(product => {
      const name = language === 'fa' ? product.name_fa : product.name_en;
      const description = language === 'fa' ? product.description_fa : product.description_en;
      const category = language === 'fa' ? product.category_name_fa : product.category_name_en;
      
      // Add product names that match
      if (name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(name);
      }
      
      // Add brands that match
      if (product.brand.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(product.brand);
      }
      
      // Add categories that match
      if (category && category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(category);
      }
      
      // Add keywords from descriptions
      const words = description.split(' ');
      words.forEach(word => {
        if (word.length > 3 && word.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 8);
  }, [query, products, language]);

  // Filter products based on query and filters
  useEffect(() => {
    let filtered = products;

    // Text search
    if (query) {
      filtered = filtered.filter(product => {
        const name = language === 'fa' ? product.name_fa : product.name_en;
        const description = language === 'fa' ? product.description_fa : product.description_en;
        const category = language === 'fa' ? product.category_name_fa : product.category_name_en;
        
        return (
          name.toLowerCase().includes(query.toLowerCase()) ||
          description.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          (category && category.toLowerCase().includes(query.toLowerCase()))
        );
      });
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => {
        const category = language === 'fa' ? product.category_name_fa : product.category_name_en;
        return category === filters.category;
      });
    }

    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    if (filters.minPrice > 0 || filters.maxPrice < 10000) {
      filtered = filtered.filter(product => 
        product.price >= filters.minPrice && product.price <= filters.maxPrice
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    if (filters.bestsellers) {
      filtered = filtered.filter(product => product.is_bestseller);
    }

    setFilteredProducts(filtered);
    setSuggestions(searchSuggestions);
  }, [query, products, filters, language, searchSuggestions]);

  // Get unique brands and categories for filter options
  const filterOptions = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand))];
    const categories = [...new Set(products.map(p => 
      language === 'fa' ? p.category_name_fa : p.category_name_en
    ).filter(Boolean))];

    return { brands, categories };
  }, [products, language]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      brand: '',
      rating: 0,
      bestsellers: false
    });
  };

  return {
    query,
    setQuery,
    products: filteredProducts,
    suggestions,
    isLoading,
    filters,
    updateFilters,
    clearFilters,
    filterOptions,
    totalResults: filteredProducts.length
  };
}
