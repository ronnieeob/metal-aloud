import React, { useState } from 'react';
import { Music, ShoppingBag, BarChart2, DollarSign, Shield, Calendar } from 'lucide-react';

export function ArtistTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Welcome to Metal Aloud!',
      icon: Music,
      description: 'As an artist, you have access to powerful tools to share your music, manage your band, and grow your fanbase.',
      tips: [
        'Upload and manage your songs',
        'Protect your music with copyright registration',
        'Track your earnings and analytics',
        'Sell merchandise to your fans'
      ]
    },
    {
      title: 'Song Management',
      icon: Music,
      description: 'Upload your songs and manage your discography with ease.',
      tips: [
        'Bulk upload entire albums',
        'Set pricing for your music',
        'Add lyrics and song details',
        'Organize songs into albums'
      ]
    },
    {
      title: 'Copyright Protection',
      icon: Shield,
      description: 'Protect your music with our built-in copyright registration system.',
      tips: [
        'Automatic or manual registration',
        'Blockchain verification',
        'Content fingerprinting',
        'Dispute resolution support'
      ]
    },
    {
      title: 'Merchandise Store',
      icon: ShoppingBag,
      description: 'Create your own merch store and sell directly to your fans.',
      tips: [
        'Multiple product categories',
        'Inventory management',
        'Order tracking',
        'Automated shipping notifications'
      ]
    },
    {
      title: 'Analytics & Insights',
      icon: BarChart2,
      description: 'Track your performance and understand your audience.',
      tips: [
        'Real-time play statistics',
        'Listener demographics',
        'Revenue tracking',
        'Engagement metrics'
      ]
    },
    {
      title: 'Release Planning',
      icon: Calendar,
      description: 'Plan and schedule your releases for maximum impact.',
      tips: [
        'Schedule future releases',
        'Promotional tools',
        'Social media integration',
        'Fan notifications'
      ]
    },
    {
      title: 'Earnings & Payouts',
      icon: DollarSign,
      description: 'Manage your earnings and get paid for your music.',
      tips: [
        'Multiple payout methods',
        'Transparent commission structure',
        'Automated payments',
        'Detailed financial reports'
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
                    localStorage.setItem('metal_aloud_artist_tutorial_completed', 'true');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}