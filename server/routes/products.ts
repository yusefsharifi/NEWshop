import { RequestHandler } from "express";
import { db } from "../database/init";

export interface Product {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  specifications_en: string;
  specifications_fa: string;
  category_id: number;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku: string;
  brand: string;
  rating: number;
  review_count: number;
  image_url: string;
  images?: string;
  is_bestseller: boolean;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: number;
    name_en: string;
    name_fa: string;
    slug: string;
  };
}

export interface Category {
  id: number;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  slug: string;
  icon: string;
}

// Get all products with optional filters
export const getProducts: RequestHandler = (req, res) => {
  const { category, bestsellers, featured, limit, search, lang = 'en' } = req.query;
  
  let query = `
    SELECT p.*, c.name_en as category_name_en, c.name_fa as category_name_fa, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  
  const params: any[] = [];
  
  if (category) {
    query += ` AND c.slug = ?`;
    params.push(category);
  }
  
  if (bestsellers === 'true') {
    query += ` AND p.is_bestseller = 1`;
  }
  
  if (featured === 'true') {
    query += ` AND p.is_featured = 1`;
  }
  
  if (search) {
    if (lang === 'fa') {
      query += ` AND (p.name_fa LIKE ? OR p.description_fa LIKE ?)`;
    } else {
      query += ` AND (p.name_en LIKE ? OR p.description_en LIKE ?)`;
    }
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY p.created_at DESC`;
  
  if (limit) {
    query += ` LIMIT ?`;
    params.push(parseInt(limit as string));
  }
  
  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const products = rows.map(row => ({
      ...row,
      category: {
        id: row.category_id,
        name_en: row.category_name_en,
        name_fa: row.category_name_fa,
        slug: row.category_slug
      }
    }));
    
    res.json(products);
  });
};

// Get single product by ID
export const getProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT p.*, c.name_en as category_name_en, c.name_fa as category_name_fa, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_active = 1
  `;
  
  db.get(query, [id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    const product = {
      ...row,
      category: {
        id: row.category_id,
        name_en: row.category_name_en,
        name_fa: row.category_name_fa,
        slug: row.category_slug
      }
    };
    
    res.json(product);
  });
};

// Get all categories
export const getCategories: RequestHandler = (req, res) => {
  const query = `SELECT * FROM categories ORDER BY name_en`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json(rows);
  });
};

// Get category by slug
export const getCategory: RequestHandler = (req, res) => {
  const { slug } = req.params;
  
  const query = `SELECT * FROM categories WHERE slug = ?`;
  
  db.get(query, [slug], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    res.json(row);
  });
};

// Admin: Create product
export const createProduct: RequestHandler = (req, res) => {
  const {
    name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
    category_id, price, original_price, stock_quantity, sku, brand,
    image_url, is_bestseller, is_featured
  } = req.body;
  
  const query = `
    INSERT INTO products (
      name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
      category_id, price, original_price, stock_quantity, sku, brand,
      image_url, is_bestseller, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [
    name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
    category_id, price, original_price, stock_quantity, sku, brand,
    image_url, is_bestseller ? 1 : 0, is_featured ? 1 : 0
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ id: this.lastID, message: 'Product created successfully' });
  });
};

// Admin: Update product
export const updateProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const {
    name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
    category_id, price, original_price, stock_quantity, sku, brand,
    image_url, is_bestseller, is_featured, is_active
  } = req.body;
  
  const query = `
    UPDATE products SET
      name_en = ?, name_fa = ?, description_en = ?, description_fa = ?,
      specifications_en = ?, specifications_fa = ?, category_id = ?,
      price = ?, original_price = ?, stock_quantity = ?, sku = ?, brand = ?,
      image_url = ?, is_bestseller = ?, is_featured = ?, is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [
    name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
    category_id, price, original_price, stock_quantity, sku, brand,
    image_url, is_bestseller ? 1 : 0, is_featured ? 1 : 0, is_active ? 1 : 0, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    res.json({ message: 'Product updated successfully' });
  });
};

// Admin: Delete product
export const deleteProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const query = `UPDATE products SET is_active = 0 WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
};
