import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSuccess(true);
      
      // Store email for reset page
      sessionStorage.setItem('reset_email', email);
      
      // In production, this would call the actual password reset endpoint
      // await supabase.auth.resetPasswordForEmail(email);
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
      }, 3000);
      
    } catch (err) {
      console.error('Failed to send reset email:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-950/50 p-8 rounded-2xl backdrop-blur-xl border border-red-900/20">
        <div className="text-center">
          <h2 className="mt-6 text-3xl metal-font text-red-500">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-900/20 text-green-400 p-4 rounded-lg">
              Password reset link sent! Check your email.
            </div>
            <a 
              href="/login" 
              className="inline-flex items-center text-red-400 hover:text-red-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </a>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-red-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Email address"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <div className="text-center">
              <a 
                href="/login" 
                className="text-sm text-red-400 hover:text-red-300"
              >
                Back to login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}