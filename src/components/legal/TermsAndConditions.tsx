import React from 'react';
import { Scale, FileText, Shield, AlertTriangle } from 'lucide-react';

export function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-red-500 mb-8">Terms and Conditions</h1>

      <div className="space-y-8">
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Scale className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">General Terms</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <p className="text-gray-300">
              By accessing and using Metal Aloud, you agree to be bound by these terms and conditions.
              These terms apply to all users, including artists, listeners, and administrators.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">User Accounts</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">Account Responsibilities</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• You must provide accurate information when creating an account</li>
              <li>• You are responsible for maintaining account security</li>
              <li>• Accounts are non-transferable</li>
              <li>• Age restrictions apply (13+ for users, 18+ for artists)</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold">Copyright and Content</h2>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <h3 className="font-semibold mb-4">Content Rules</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Artists must own or have rights to uploaded content</li>
              <li>• Automatic and manual copyright protection available</li>
              <li>• Content must not violate any laws or rights</li>
              <li>• We reserve the right to remove content</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="bg-red-900/20 p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold">Important Notices</h2>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Service availability is not guaranteed</li>
              <li>• We may modify these terms at any time</li>
              <li>• Violation may result in account termination</li>
              <li>• Some features require premium subscription</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Subscription Terms</h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <ul className="space-y-2 text-gray-300">
              <li>• Subscription fees are charged in advance</li>
              <li>• Automatic renewal unless cancelled</li>
              <li>• Refunds subject to our refund policy</li>
              <li>• Price changes with 30 days notice</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Artist Terms</h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <ul className="space-y-2 text-gray-300">
              <li>• Commission rates based on revenue tiers</li>
              <li>• Monthly payouts for eligible earnings</li>
              <li>• Content quality standards must be met</li>
              <li>• Verification required for certain features</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">AI and Machine Learning</h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
            <ul className="space-y-2 text-gray-300">
              <li>• AI is used for recommendations and content analysis</li>
              <li>• Automated copyright protection available</li>
              <li>• Content may be used to train AI models</li>
              <li>• Users can opt-out of certain AI features</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">
              For questions about our terms, please contact{' '}
              <a href="mailto:legal@metalaloud.com" className="text-red-400 hover:text-red-300">
                legal@metalaloud.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}