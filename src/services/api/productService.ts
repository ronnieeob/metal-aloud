import { Product } from '../../types';
import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from './config';

export class ProductService {
  async getProducts(artistId: string) {
    return apiRequest<Product[]>(`${API_ENDPOINTS.products}?artistId=${artistId}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    return apiRequest<Product>(API_ENDPOINTS.products, {
      method: 'POST',
      body: product,
    });
  }

  async updateProduct(product: Product) {
    return apiRequest<Product>(`${API_ENDPOINTS.products}/${product.id}`, {
      method: 'PUT',
      body: product,
    });
  }

  async deleteProduct(id: string) {
    return apiRequest(`${API_ENDPOINTS.products}/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<{ url: string }>(`${API_ENDPOINTS.products}/upload`, {
      method: 'POST',
      body: formData,
    });
  }
}