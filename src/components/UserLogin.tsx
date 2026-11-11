/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, UserPlus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserLoginProps {
  isMarathi: boolean;
  onNavigate: (page: string) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ isMarathi, onNavigate }) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobile: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        const result = await signUp(formData.email, formData.password, formData.fullName, formData.mobile);
        if (result?.needsConfirmation) {
          setMessage('Account created! Please check your email for a confirmation link before signing in.');
          setMessageType('info');
          setIsLogin(true); // Switch to login mode
        } else {
          onNavigate('my-dashboard');
        }
      }
    } catch (error: any) {
      if (error.message.includes('Email not confirmed') || error.message.includes('confirm your email')) {
        setMessage('Please check your email and click the confirmation link before signing in.');
        setMessageType('info');
      } else {
        setError(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isMarathi ? '??????????? ?????' : 'Gram Panchayat Login'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? (isMarathi ? '???? ???? ???? ??' : 'Sign in to your account')
              : (isMarathi ? '??? ?? ??? ??' : 'Create a new account')
            }
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage('');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isMarathi ? '????' : 'Login'}
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage('');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isMarathi ? '???' : 'Sign Up'}
          </button>
        </div>

        {/* Message display */}
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isMarathi ? '??? ??' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={isMarathi ? '??? ??? ?? ????? ??' : 'Enter your full name'}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isMarathi ? '???' : 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={isMarathi ? '??? ??? ??? ????? ??' : 'Enter your email address'}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isMarathi ? '???? ???' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={isMarathi ? '??? ???? ??? ????? ??' : 'Enter your mobile number'}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isMarathi ? '?????' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={isMarathi ? '??? ????? ????? ??' : 'Enter your password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-md hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isMarathi ? '??? ????? ??...' : 'Please wait...'}
              </div>
            ) : (
              isLogin 
                ? (isMarathi ? '???? ??' : 'Sign In')
                : (isMarathi ? '?? ??? ??' : 'Create Account')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
             {isMarathi ? '???????? ???' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
