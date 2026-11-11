/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(passwords.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('पासवर्ड सभी आवश्यकताओं को पूरा नहीं करता');
      setLoading(false);
      return;
    }

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 2000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'पासवर्ड बदलने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">पासवर्ड सफलतापूर्वक बदल दिया गया!</h3>
          <p className="text-gray-600">आपका नया पासवर्ड सेट हो गया है।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">पासवर्ड बदलें</h2>
              <p className="text-sm text-gray-600">अपना एडमिन पासवर्ड अपडेट करें</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              नया पासवर्ड
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="नया पासवर्ड दर्ज करें"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              पासवर्ड की पुष्टि करें
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="पासवर्ड दोबारा दर्ज करें"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {passwords.newPassword && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">पासवर्ड आवश्यकताएं:</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                  <span>कम से कम 8 अक्षर</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasUpper ? '✓' : '✗'}</span>
                  <span>एक बड़ा अक्षर (A-Z)</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasLower ? '✓' : '✗'}</span>
                  <span>एक छोटा अक्षर (a-z)</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                  <span>एक संख्या (0-9)</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{passwordValidation.hasSpecial ? '✓' : '✗'}</span>
                  <span>एक विशेष चिह्न (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || passwords.newPassword !== passwords.confirmPassword}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>बदला जा रहा है...</span>
                </div>
              ) : (
                'पासवर्ड बदलें'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>सुरक्षा सुझाव:</strong><br />
            • एक मजबूत और अनोखा पासवर्ड चुनें<br />
            • अपना पासवर्ड किसी के साथ साझा न करें<br />
            • नियमित रूप से पासवर्ड बदलते रहें
          </p>
        </div>
      </div>
    </div>
  );
}