import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface GrievancePageProps {
  language: Language;
}

const GrievancePage = ({ language }: GrievancePageProps) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({
    complainant_name: '',
    mobile: '',
    email: '',
    category: '',
    subject: '',
    description: '',
    location: '',
  });

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  const categories = [
    { en: 'Water Supply', mr: 'पाणीपुरवठा' },
    { en: 'Sanitation', mr: 'स्वच्छता' },
    { en: 'Street Lights', mr: 'रस्त्यावरील दिवे' },
    { en: 'Roads', mr: 'रस्ते' },
    { en: 'Drainage', mr: 'गटारव्यवस्था' },
    { en: 'Garbage Collection', mr: 'कचरा संकलन' },
    { en: 'Other', mr: 'इतर' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate ticket number
      const timestamp = Date.now();
      const generatedTicket = `GRV${timestamp}`;

      const { error } = await supabase.from('cit_complaints').insert({
        subject: formData.subject,
        description: `Ticket: ${generatedTicket}\nName: ${formData.complainant_name}\nMobile: ${formData.mobile}\nEmail: ${formData.email || '-'}\nCategory: ${formData.category}\nLocation: ${formData.location}\n\nDetails:\n${formData.description}`,
        status: 'Submitted',
      });

      if (error) throw error;

      await supabase.from('cms_public_tracking').insert({
        reference_type: 'grievance',
        reference_number: generatedTicket,
        status: 'Submitted',
        subject: formData.subject
      });

      setTicketNumber(generatedTicket);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        complainant_name: '',
        mobile: '',
        email: '',
        category: '',
        subject: '',
        description: '',
        location: '',
      });
    } catch (error) {
      console.error('Error submitting grievance:', error);
      alert(t('Failed to submit grievance. Please try again.', 'तक्रार सबमिट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('Grievance Submitted Successfully!', 'तक्रार यशस्वीरित्या सबमिट झाली!')}
          </h2>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-2">
              {t('Your Ticket Number:', 'तुमचा तिकीट नंबर:')}
            </p>
            <p className="text-3xl font-mono font-bold text-green-600">{ticketNumber}</p>
          </div>
          <p className="text-gray-600 mb-6">
            {t(
              'Please save this ticket number for future reference. You can track the status of your grievance using this number.',
              'कृपया भविष्यातील संदर्भासाठी हा तिकीट नंबर सेव्ह करा. तुम्ही या नंबरचा वापर करून तुमच्या तक्रारीची स्थिती ट्रॅक करू शकता.'
            )}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            {t('Submit Another Grievance', 'आणखी एक तक्रार सबमिट करा')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('Submit Grievance', 'तक्रार नोंदवा')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t(
            'Register your complaint and we will address it promptly',
            'तुमची तक्रार नोंदवा आणि आम्ही लवकरच त्याचे निवारण करू'
          )}
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-blue-800 font-semibold mb-1">
              {t('Important Information', 'महत्त्वाची माहिती')}
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• {t('You will receive a unique ticket number after submission', 'सबमिशननंतर तुम्हाला एक अद्वितीय तिकीट नंबर मिळेल')}</li>
              <li>• {t('Keep your ticket number safe for tracking', 'ट्रॅकिंगसाठी तुमचा तिकीट नंबर सुरक्षित ठेवा')}</li>
              <li>• {t('We aim to resolve grievances within 7-15 days', 'आम्ही 7-15 दिवसांत तक्रारींचे निराकरण करण्याचे लक्ष्य ठेवतो')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grievance Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Full Name', 'पूर्ण नाव')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="complainant_name"
              value={formData.complainant_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Enter your full name', 'तुमचे पूर्ण नाव टाका')}
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Mobile Number', 'मोबाईल नंबर')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="9876543210"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Email Address', 'ईमेल पत्ता')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Category', 'श्रेणी')} <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">{t('Select Category', 'श्रेणी निवडा')}</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.en}>
                  {language === 'mr' ? cat.mr : cat.en}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Location / Address', 'स्थान / पत्ता')}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Ward / Area / Landmark', 'प्रभाग / क्षेत्र / खूण')}
            />
          </div>

          {/* Subject */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Subject', 'विषय')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Brief summary of your complaint', 'तुमच्या तक्रारीचा संक्षिप्त सारांश')}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Description', 'तपशील')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Describe your complaint in detail...', 'तुमची तक्रार तपशीलवार वर्णन करा...')}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('Submitting...', 'सबमिट करत आहे...')}
              </>
            ) : (
              <>
                {t('Submit Grievance', 'तक्रार सबमिट करा')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrievancePage;
