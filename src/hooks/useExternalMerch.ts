import { useState, useEffect } from 'react';
import { Product } from '../types';

// External merch sources
const EXTERNAL_SOURCES = [
  'https://www.emp.co.uk',
  'https://www.impericon.com',
  'https://www.rockabilia.com',
  'https://www.metalshop.us'
];

export function useExternalMerch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExternalProducts = async () => {
      try {
        setLoading(true);
        // In production, implement actual API calls to external merch sites
        // For now, return mock data
        const mockProducts: Product[] = [
          {
            id: 'ext-1',
            name: 'Metallica Master of Puppets T-Shirt',
            description: 'Official Metallica merchandise featuring the iconic Master of Puppets album art',
            price: 24.99,
            imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
            category: 'clothing',
            externalUrl: 'https://www.emp.co.uk/metallica-shirt',
            artistId: 'metallica'
          },
          {
            id: 'ext-2',
            name: 'Iron Maiden Trooper Hoodie',
            description: 'Premium quality hoodie featuring Eddie from The Trooper',
            price: 49.99,
            imageUrl: 'https://images.unsplash.com/photo-1572708609354-e4b4bdfe5a93',
            category: 'clothing',
            externalUrl: 'https://www.impericon.com/ironmaiden-hoodie',
            artistId: 'iron-maiden'
          },
          {
            id: 'ext-3',
            name: 'Slayer Logo Patch',
            description: 'Official embroidered Slayer logo patch',
            price: 7.99,
            imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
            category: 'patches',
            externalUrl: 'https://www.metalshop.us/slayer-patch',
            artistId: 'slayer'
          }
        ];

        setProducts(mockProducts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch external products:', err);
        setError('Failed to load external products');
      } finally {
        setLoading(false);
      }
    };

    fetchExternalProducts();
  }, []);

  return {
    products,
    loading,
    error
  };
}