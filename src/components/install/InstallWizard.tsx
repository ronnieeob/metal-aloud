import React, { useState } from 'react';
import { Check, Database, Globe, Key, Server, Settings, User } from 'lucide-react';

interface InstallStep {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
}

export function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    dbHost: 'localhost',
    dbUser: '',
    dbPassword: '',
    dbName: 'metal_aloud',
    dbPort: '3306',
    
    siteName: 'Metal Aloud',
    siteUrl: '',
    adminEmail: '',
    
    adminUsername: '',
    adminPassword: '',
    confirmPassword: '',
    
    enableRegistration: true,
    enableUploads: true,
    maxUploadSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: InstallStep[] = [
    { id: 'requirements', title: 'System Requirements', icon: Server, completed: true },
    { id: 'database', title: 'Database Setup', icon: Database, completed: false },
    { id: 'admin', title: 'Admin Account', icon: User, completed: false },
    { id: 'license', title: 'License', icon: Key, completed: false },
    { id: 'settings', title: 'Site Settings', icon: Settings, completed: false },
    { id: 'finish', title: 'Complete', icon: Check, completed: false }
  ];

  const validateStep = () => {
    switch (currentStep) {
      case 1: // Database
        if (!formData.dbUser || !formData.dbPassword) {
          setError('Database credentials are required');
          return false;
        }
        break;
      case 2: // Admin
        if (!formData.adminUsername || !formData.adminPassword) {
          setError('Admin credentials are required');
          return false;
        }
        if (formData.adminPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      case 3: // Settings
        if (!formData.siteName || !formData.siteUrl || !formData.adminEmail) {
          setError('All site settings are required');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    setError(null);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update step completion
      steps[currentStep].completed = true;
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to login
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-zinc-900 to-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-metal text-red-500 mb-4">Metal Aloud</h1>
          <p className="text-gray-400">Installation Wizard</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStep ? 'bg-red-500 text-white' :
                index === currentStep ? 'bg-red-900/50 text-red-500 border-2 border-red-500' :
                'bg-zinc-800'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
          {error && (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">System Requirements</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                  <span>PHP Version (>= 8.1)</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                  <span>MySQL (>= 5.7)</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                  <span>Node.js (>= 18.x)</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                  <span>Required PHP Extensions</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Database Configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Database Host</label>
                  <input
                    type="text"
                    value={formData.dbHost}
                    onChange={(e) => setFormData({ ...formData, dbHost: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Database Port</label>
                  <input
                    type="text"
                    value={formData.dbPort}
                    onChange={(e) => setFormData({ ...formData, dbPort: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Database Name</label>
                  <input
                    type="text"
                    value={formData.dbName}
                    onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Database User</label>
                  <input
                    type="text"
                    value={formData.dbUser}
                    onChange={(e) => setFormData({ ...formData, dbUser: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Database Password</label>
                  <input
                    type="password"
                    value={formData.dbPassword}
                    onChange={(e) => setFormData({ ...formData, dbPassword: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Admin Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.adminUsername}
                    onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">License Activation</h2>
              <div>
                <label className="block text-sm font-medium mb-2">License Key</label>
                <input
                  type="text"
                  value={formData.licenseKey}
                  onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                  className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
              </div>
              <p className="text-sm text-gray-400">
                Enter your license key to activate Metal Aloud. If you don't have a license key,
                you can purchase one from our website.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Site Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Site URL</label>
                  <input
                    type="url"
                    value={formData.siteUrl}
                    onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                    placeholder="https://your-domain.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full bg-zinc-700 border border-red-900/20 rounded p-2"
                  />
                </div>
                <div className="col-span-2 space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.enableRegistration}
                      onChange={(e) => setFormData({ ...formData, enableRegistration: e.target.checked })}
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                    />
                    <span>Enable public registration</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.enableUploads}
                      onChange={(e) => setFormData({ ...formData, enableUploads: e.target.checked })}
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                    />
                    <span>Enable file uploads</span>
                  </label>
                  {formData.enableUploads && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
                      <input
                        type="number"
                        value={formData.maxUploadSize}
                        onChange={(e) => setFormData({ ...formData, maxUploadSize: parseInt(e.target.value) })}
                        className="w-32 bg-zinc-700 border border-red-900/20 rounded p-2"
                        min="1"
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Installation Complete!</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Metal Aloud has been successfully installed. You can now log in to your admin
                  dashboard using the credentials you provided.
                </p>
                <div className="bg-zinc-900/50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Admin Login Details</h3>
                  <p className="text-sm text-gray-400">Username: {formData.adminUsername}</p>
                  <p className="text-sm text-gray-400">URL: {formData.siteUrl}/admin</p>
                </div>
                <div className="bg-red-900/20 p-4 rounded-lg">
                  <h3 className="font-bold text-red-400 mb-2">Important Security Steps</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                    <li>Delete the install.php file</li>
                    <li>Set proper file permissions</li>
                    <li>Configure your firewall</li>
                    <li>Set up regular backups</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Back
              </button>
            )}
            <button
              onClick={currentStep === steps.length - 1 ? handleInstall : handleNext}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 ml-auto"
            >
              {loading ? 'Processing...' : currentStep === steps.length - 1 ? 'Finish Installation' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}