import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBag, Download } from 'lucide-react';

export function UserPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = React.useState<Array<{
    id: string;
    type: 'song' | 'merch';
    title: string;
    artist: string;
    price: number;
    purchaseDate: string;
    downloadUrl?: string;
  }>>([]);

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Your Purchases</h2>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
          >
            <div className="flex items-center space-x-4">
              <ShoppingBag className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="font-semibold">{purchase.title}</h3>
                <p className="text-sm text-gray-400">{purchase.artist}</p>
                <p className="text-xs text-red-400">${purchase.price}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {new Date(purchase.purchaseDate).toLocaleDateString()}
              </span>
              {purchase.type === 'song' && purchase.downloadUrl && (
                <a
                  href={purchase.downloadUrl}
                  className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                  download
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}

        {purchases.length === 0 && (
          <p className="text-center text-gray-400 py-8">No purchases yet</p>
        )}
      </div>
    </div>
  );
}