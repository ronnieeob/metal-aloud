import { Product } from '../types';

const STORAGE_KEY = 'metal_aloud_products';

export class ProductService {
  private getStoredProducts(): Product[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private setStoredProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  async getProducts(artistId: string): Promise<Product[]> {
    const products = this.getStoredProducts();
    return products.filter(p => p.artistId === artistId);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const products = this.getStoredProducts();
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    this.setStoredProducts([...products, newProduct]);
    return newProduct;
  }

  async updateProduct(product: Product): Promise<Product> {
    const products = this.getStoredProducts();
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : p
    );
    
    this.setStoredProducts(updatedProducts);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const products = this.getStoredProducts();
    this.setStoredProducts(products.filter(p => p.id !== id));
  }
}