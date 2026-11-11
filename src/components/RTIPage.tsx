import { useState } from 'react';
import { ArrowLeft, FileText, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface RTIPageProps {
  language: Language;
  onBack: () => void;
}

const RTIPage = ({ language, onBack }: RTIPageProps) => {
  const { settings } = useWebsiteSettings();
  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    information_sought: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appNumber = `RTI${Date.now()}`;
      
      const { error } = await supabase
        .from('rti_applications')
        .insert([{
          ...formData,
          application_number: appNumber,
          status: 'submitted',
        }]);

      if (error) throw error;

      setApplicationNumber(appNumber);
      setSubmitted(true);
      setFormData({
        applicant_name: '',
        email: '',
        phone: '',
        address: '',
        subject: '',
        information_sought: '',
      });
    } catch (error) {
      console.error('Error submitting RTI:', error);
      alert(t('Failed to submit application', 'अर्ज सादर करण्यात अयशस्वी'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('Application Submitted!', 'अर्ज सादर झाला!')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('Your RTI application has been submitted successfully.', 'तुमचा RTI अर्ज यशस्वीरित्या सादर झाला आहे.')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 mb-1">{t('Application Number', 'अर्ज क्रमांक')}</p>
            <p className="text-2xl font-bold text-blue-900">{applicationNumber}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {t('You will receive a response within 30 days as per RTI Act 2005.', 'RTI कायदा 2005 नुसार तुम्हाला 30 दिवसांत प्रतिसाद मिळेल.')}
          </p>
          <button
            onClick={onBack}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            {t('Back to Home', 'मुख्यपृष्ठावर परत')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>{t('Back', 'मागे')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Right to Information (RTI)', 'माहिती अधिकार (RTI)')}
          </h1>
          <p className="text-orange-100">
            {t('Submit your RTI application online', 'तुमचा RTI अर्ज ऑनलाइन सादर करा')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText size={24} />
            {t('About RTI Act 2005', 'RTI कायदा 2005 बद्दल')}
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('Every citizen has the right to access information from public authorities.', 'प्रत्येक नागरिकाला सार्वजनिक प्राधिकरणाकडून माहिती मिळविण्याचा अधिकार आहे.')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('Response must be provided within 30 days of application.', 'अर्जाच्या 30 दिवसांच्या आत प्रतिसाद देणे आवश्यक आहे.')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('Application fee: ₹10 (can be paid at Gram Panchayat office)', 'अर्ज शुल्क: ₹10 (ग्रामपंचायत कार्यालयात भरता येईल)')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('Keep your application number for tracking.', 'ट्रॅकिंगसाठी तुमचा अर्ज क्रमांक ठेवा.')}</span>
            </li>
          </ul>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('RTI Application Form', 'RTI अर्ज फॉर्म')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Applicant Name', 'अर्जदाराचे नाव')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="applicant_name"
                value={formData.applicant_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('Enter your full name', 'तुमचे पूर्ण नाव प्रविष्ट करा')}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Email', 'ईमेल')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Phone Number', 'फोन नंबर')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Address', 'पत्ता')} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder={t('Enter your complete address', 'तुमचा संपूर्ण पत्ता प्रविष्ट करा')}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Subject', 'विषय')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('Brief subject of your query', 'तुमच्या प्रश्नाचा संक्षिप्त विषय')}
              />
            </div>

            {/* Information Sought */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Information Sought', 'मागणी केलेली माहिती')} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="information_sought"
                value={formData.information_sought}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder={t('Provide detailed description of the information you are seeking...', 'तुम्ही शोधत असलेल्या माहितीचे तपशीलवार वर्णन द्या...')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('Be specific and clear about the information you need', 'तुम्हाला आवश्यक असलेल्या माहितीबद्दल विशिष्ट आणि स्पष्ट रहा')}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin" size={20} />
                    {t('Submitting...', 'सादर करत आहे...')}
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {t('Submit Application', 'अर्ज सादर करा')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                {t('Cancel', 'रद्द करा')}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare size={20} />
            {t('Need Help?', 'मदत हवी आहे का?')}
          </h3>
          <p className="text-gray-700 mb-2">
            {t('Public Information Officer (PIO)', 'सार्वजनिक माहिती अधिकारी (PIO)')}
          </p>
          <p className="text-gray-600">
            {t('Contact: Gram Panchayat Office', 'संपर्क: ग्रामपंचायत कार्यालय')}<br />
            {t(`Phone: ${settings.phone_number || '+91 0000000000'}`, `फोन: ${settings.phone_number || '+91 0000000000'}`)}<br />
            {t(`Email: ${settings.email || 'pio@grampanchayat.gov.in'}`, `ईमेल: ${settings.email || 'pio@grampanchayat.gov.in'}`)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RTIPage;
