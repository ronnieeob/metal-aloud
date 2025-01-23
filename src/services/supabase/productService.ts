import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Database } from '../../lib/database.types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type DbProduct = Database['public']['Tables']['products']['Row'];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    artistId: 'mock-artist-1',
    name: 'Metal Band T-Shirt',
    description: 'Official band merchandise',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    category: 'clothing',
    stockQuantity: 100
  },
  {
    id: '2',
    artistId: 'mock-artist-2',
    name: 'Band Logo Patch',
    description: 'Embroidered patch with band logo',
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
    category: 'patches',
    stockQuantity: 50
  }
];

const mapDbProductToProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  artistId: dbProduct.artist_id,
  name: dbProduct.name,
  description: dbProduct.description,
  price: dbProduct.price,
  imageUrl: dbProduct.image_url,
  category: dbProduct.category,
  stockQuantity: dbProduct.stock_quantity,
  createdAt: dbProduct.created_at
});

export class ProductService {
  async getProducts(artistId: string) {
    // Use mock data in development or if Supabase is not configured
    if (import.meta.env.DEV || !import.meta.env.VITE_SUPABASE_URL) {
      const mockProducts = MOCK_PRODUCTS;
      return artistId 
        ? mockProducts.filter(p => p.artistId === artistId)
        : mockProducts;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('artist_id', artistId);

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to mock data on error
      return artistId 
        ? MOCK_PRODUCTS.filter(p => p.artistId === artistId)
        : MOCK_PRODUCTS;
    }
    return (data || []).map(mapDbProductToProduct);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        artist_id: product.artistId,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        category: product.category,
        stock_quantity: product.stockQuantity
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbProductToProduct(data);
  }

  async updateProduct(product: Product) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        category: product.category,
        stock_quantity: product.stockQuantity
      })
      .eq('id', product.id)
      .select()
      .single();

    if (error) throw error;
    return mapDbProductToProduct(data);
  }

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}