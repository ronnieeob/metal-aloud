import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-red-500 mb-8">Privacy Policy</h1>

      <div className="space-y-8">
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Data Collection</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">Information We Collect</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Account information (name, email, profile picture)</li>
              <li>• Music preferences and listening history</li>
              <li>• Payment information (processed securely by our payment providers)</li>
              <li>• Usage data and analytics</li>
              <li>• Device and browser information</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Data Usage</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">How We Use Your Data</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Personalize your music experience</li>
              <li>• Process payments and manage subscriptions</li>
              <li>• Improve our services using AI and machine learning</li>
              <li>• Provide customer support</li>
              <li>• Send relevant notifications and updates</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Data Security</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">Security Measures</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• End-to-end encryption for sensitive data</li>
              <li>• Regular security audits and updates</li>
              <li>• Secure payment processing</li>
              <li>• Two-factor authentication support</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Your Rights</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">Data Control</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Access your personal data</li>
              <li>• Request data deletion</li>
              <li>• Update your information</li>
              <li>• Control your privacy settings</li>
              <li>• Opt-out of data collection</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="bg-red-900/20 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">AI and Machine Learning</h3>
            <p className="text-gray-300">
              We use artificial intelligence and machine learning to enhance your music experience:
            </p>
            <ul className="mt-4 space-y-2 text-gray-300">
              <li>• Personalized music recommendations</li>
              <li>• Content moderation and copyright protection</li>
              <li>• Fraud detection and prevention</li>
              <li>• Service optimization</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              You can control AI-powered features in your account settings.
            </p>
          </div>
        </section>

        <section>
          <div className="text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">
              For questions about our privacy policy, please contact{' '}
              <a href="mailto:privacy@metalaloud.com" className="text-red-400 hover:text-red-300">
                privacy@metalaloud.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}