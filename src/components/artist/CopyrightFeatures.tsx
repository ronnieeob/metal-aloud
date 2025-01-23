import React from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';

interface CopyrightFeaturesProps {
  type: 'basic' | 'pro';
  interval: 'monthly' | 'yearly';
}

export function CopyrightFeatures({ type, interval }: CopyrightFeaturesProps) {
  const features = {
    basic: {
      monthly: {
        quota: 5,
        features: [
          'Manual copyright registration',
          'Basic protection level',
          'Standard support',
          'Up to 5 songs per month'
        ]
      },
      yearly: {
        quota: 60,
        features: [
          'Manual copyright registration',
          'Basic protection level',
          'Standard support',
          'Up to 60 songs per year',
          '2 months free'
        ]
      }
    },
    pro: {
      monthly: {
        quota: 20,
        features: [
          'Automatic copyright registration',
          'Premium protection level',
          'Priority support',
          'Up to 20 songs per month',
          'Blockchain verification'
        ]
      },
      yearly: {
        quota: -1, // Unlimited
        features: [
          'Automatic copyright registration',
          'Premium protection level',
          'Priority support',
          'Unlimited songs',
          'Blockchain verification',
          '2 months free'
        ]
      }
    }
  };

  const currentFeatures = features[type][interval];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-red-400">
        <Shield className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Copyright Protection</h3>
      </div>

      <div className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Monthly Quota</span>
          <span className="text-red-400 font-bold">
            {currentFeatures.quota === -1 ? 'Unlimited' : currentFeatures.quota}
          </span>
        </div>

        <div className="space-y-2">
          {currentFeatures.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {type === 'basic' && (
          <div className="mt-4 flex items-start space-x-2 text-yellow-400 bg-yellow-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Upgrade to Pro for automatic registration and unlimited songs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}