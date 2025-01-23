import { query } from '../../lib/database';
import { Product } from '../../types';

export class ProductService {
  async getProducts(artistId?: number): Promise<Product[]> {
    const sql = artistId
      ? 'SELECT * FROM products WHERE artist_id = ?'
      : 'SELECT * FROM products';
    
    const params = artistId ? [artistId] : [];
    return query<Product[]>(sql, params);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO products (artist_id, name, description, price, image_url, category, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product.artist_id, product.name, product.description, product.price, product.image_url, product.category, product.stock_quantity]
    );

    return {
      id: result.insertId,
      ...product
    };
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`);
    
    const values = Object.values(updates)
      .filter((_, index) => Object.keys(updates)[index] !== 'id');

    await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteProduct(id: number): Promise<void> {
    await query('DELETE FROM products WHERE id = ?', [id]);
  }
}