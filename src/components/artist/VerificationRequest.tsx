import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Upload, Link } from 'lucide-react';

export function VerificationRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    website: '',
    socialLinks: {
      spotify: '',
      youtube: '',
      instagram: '',
      facebook: ''
    },
    description: '',
    documents: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Store verification request in localStorage for demo
      const verificationRequests = JSON.parse(
        localStorage.getItem('metal_aloud_verification_requests') || '[]'
      );

      const request = {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      verificationRequests.push(request);
      localStorage.setItem(
        'metal_aloud_verification_requests',
        JSON.stringify(verificationRequests)
      );

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit verification request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <div className="text-center">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-500 mb-2">Verification Request Submitted</h2>
          <p className="text-gray-400">
            Your verification request has been submitted successfully. Our team will review your application and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Artist Verification</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Official Website</label>
          <div className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="flex-1 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="https://your-website.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Media Links</h3>
          {Object.entries(formData.socialLinks).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: {
                    ...formData.socialLinks,
                    [platform]: e.target.value
                  }
                })}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder={`https://${platform}.com/your-profile`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description of Your Work
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-32 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            placeholder="Tell us about your music, achievements, and why you should be verified..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Supporting Documents
          </label>
          <div className="border-2 border-dashed border-red-900/20 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400 mb-2">
              Upload press releases, articles, or other documents that verify your identity
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setFormData({ 
                ...formData, 
                documents: Array.from(e.target.files || [])
              })}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
            >
              Select Files
            </label>
            {formData.documents.length > 0 && (
              <div className="mt-4 text-sm text-gray-400">
                {formData.documents.length} files selected
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Submit for Verification'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}