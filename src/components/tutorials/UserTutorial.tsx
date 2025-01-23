import React, { useState } from 'react';
import { Music, Heart, Users, ShoppingBag, Star, Headphones } from 'lucide-react';

export function UserTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Welcome to Metal Aloud!',
      icon: Music,
      description: 'Your ultimate destination for metal music. Discover, stream, and connect with the metal community.',
      tips: [
        'Browse music by genre',
        'Create custom playlists',
        'Follow your favorite artists',
        'Join the metal community'
      ]
    },
    {
      title: 'Discover Music',
      icon: Headphones,
      description: 'Explore our vast collection of metal music across all subgenres.',
      tips: [
        'Use genre filters to find your style',
        'Listen to featured playlists',
        'Get personalized recommendations',
        'Preview songs before purchase'
      ]
    },
    {
      title: 'Create Collections',
      icon: Heart,
      description: 'Build your personal metal music library.',
      tips: [
        'Like your favorite songs',
        'Create custom playlists',
        'Download for offline listening',
        'Share playlists with friends'
      ]
    },
    {
      title: 'Connect with Others',
      icon: Users,
      description: 'Join the metal community and connect with fellow metalheads.',
      tips: [
        'Follow other users',
        'Share your favorite tracks',
        'Join discussions',
        'Discover new artists'
      ]
    },
    {
      title: 'Shop Merchandise',
      icon: ShoppingBag,
      description: 'Support your favorite artists by purchasing official merchandise.',
      tips: [
        'Browse artist merch stores',
        'Get exclusive items',
        'Track your orders',
        'Collect reward points'
      ]
    },
    {
      title: 'Earn Rewards',
      icon: Star,
      description: 'Get rewarded for being an active member of the community.',
      tips: [
        'Earn points by listening',
        'Get rewards for sharing',
        'Unlock exclusive content',
        'Redeem for merchandise'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-red-500/20">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="mt-6">
            <div className="flex items-center justify-center mb-6">
              {React.createElement(tutorialSteps[currentStep].icon, {
                className: "w-16 h-16 text-red-500 animate-pulse"
              })}
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-4 text-red-500">
              {tutorialSteps[currentStep].title}
            </h2>
            
            <p className="text-gray-300 text-center mb-6">
              {tutorialSteps[currentStep].description}
            </p>

            <div className="bg-zinc-800/50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-red-400 mb-3">Quick Tips:</h3>
              <ul className="space-y-2">
                {tutorialSteps[currentStep].tips.map((tip, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentStep === index ? 'bg-red-500 w-4' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>

              {currentStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('metal_aloud_user_tutorial_completed', 'true');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Start Listening
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}