import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  is_bestseller: boolean;
  category_name_en?: string;
  category_name_fa?: string;
  image_url: string;
}

export default function AdminProducts() {
  const { t, dir, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySummary, setInventorySummary] = useState<Record<number, { total: number; warehouses: Record<string, number> }>>({});

  useEffect(() => {
    fetchProducts();
    fetchInventorySummary();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch('/api/admin/inventory/items');
      if (!response.ok) throw new Error('Failed to fetch inventory snapshot');
      const data = await response.json();
      const summary = data.reduce((acc: Record<number, { total: number; warehouses: Record<string, number> }>, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = { total: 0, warehouses: {} };
        }
        const qty = item.stock_on_hand || 0;
        acc[productId].total += qty;
        const warehouseName = item.warehouse_name || 'Warehouse';
        acc[productId].warehouses[warehouseName] = (acc[productId].warehouses[warehouseName] || 0) + qty;
        return acc;
      }, {});
      setInventorySummary(summary);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    const nameToSearch = language === 'fa' ? product.name_fa : product.name_en;
    return nameToSearch.toLowerCase().includes(searchLower);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Products Management</h2>
            <p className="text-gray-600">Manage your pool equipment inventory</p>
          </div>
          
          <Link to="/admin/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                />
              </div>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>Product</th>
                      <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>Price</th>
                      <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>Stock</th>
                      <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>Status</th>
                      <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const summary = inventorySummary[product.id];
                      const stockLevel = summary ? summary.total : product.stock_quantity;
                      const stockClass =
                        stockLevel > 10
                          ? 'bg-green-100 text-green-800'
                          : stockLevel > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800';
                      return (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                              <img
                                src={product.image_url}
                                alt={language === 'fa' ? product.name_fa : product.name_en}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {language === 'fa' ? product.name_fa : product.name_en}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {language === 'fa' ? product.category_name_fa : product.category_name_en}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">${product.price}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockClass}`}>
                                {stockLevel} {language === 'fa' ? 'واحد' : 'units'}
                              </span>
                              {summary && (
                                <div className="text-[11px] text-gray-500">
                                  {Object.entries(summary.warehouses)
                                    .map(([warehouse, qty]) => `${warehouse}: ${qty}`)
                                    .join(' • ')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {product.is_bestseller && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Bestseller
                              </Badge>
                            )}
                          </div>
                          </td>
                          <td className="py-4 px-4">
                          <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
