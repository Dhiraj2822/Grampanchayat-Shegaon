import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactInfo, Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface ContactPageProps {
  language: Language;
}

const ContactPage = ({ language }: ContactPageProps) => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const { settings } = useWebsiteSettings();

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  // Get dynamic values
  const villageName = language === 'mr' 
    ? (settings.village_name_mr || settings.village_name || 'गाव')
    : language === 'hi'
      ? (settings.village_name_hi || settings.village_name_mr || settings.village_name || 'गांव')
      : (settings.village_name || 'Village');
  const noDataLabel = t('No data available', 'माहिती उपलब्ध नाही');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_contact_info')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return '🚨';
      case 'office':
        return '🏛️';
      case 'helpline':
        return '📞';
      default:
        return '📱';
    }
  };

  const getContactTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return 'from-red-600 to-red-700 border-red-300';
      case 'office':
        return 'from-green-600 to-green-700 border-green-300';
      case 'helpline':
        return 'from-blue-600 to-blue-700 border-blue-300';
      default:
        return 'from-gray-600 to-gray-700 border-gray-300';
    }
  };

  // Group contacts by type
  const groupedContacts = contacts.reduce((acc, contact) => {
    const type = contact.contact_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(contact);
    return acc;
  }, {} as Record<string, ContactInfo[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('Contact Us', 'आमच्याशी संपर्क साधा')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t(`Get in touch with Gram Panchayat ${villageName}`, `ग्रामपंचायत ${villageName} शी संपर्क साधा`)}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t('Gram Panchayat Office', 'ग्रामपंचायत कार्यालय')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-start gap-3">
            <MapPin className="text-green-600 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500">{t('Address', 'पत्ता')}</p>
              <p className="font-semibold">
                {language === 'mr'
                  ? (settings.office_address_mr || settings.office_address || noDataLabel)
                  : language === 'hi'
                    ? (settings.office_address_hi || settings.office_address_mr || settings.office_address || noDataLabel)
                    : (settings.office_address || noDataLabel)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="text-green-600 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500">{t('Officer', 'ग्रामपंचायत अधिकारी')}</p>
              <p className="font-semibold">
                {language === 'mr'
                  ? (settings.gram_panchayat_officer_name_mr || settings.gram_panchayat_officer_name)
                  : settings.gram_panchayat_officer_name}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="text-green-600 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500">{t('Phone', 'मोबाइल नंबर')}</p>
              <a href={`tel:${settings.phone_number}`} className="font-semibold text-green-600">
                {settings.phone_number}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="text-green-600 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500">{t('Panchayat Email', 'ग्रामपंचायत ई-मेल')}</p>
              <a href={`mailto:${settings.email}`} className="font-semibold text-green-600">
                {settings.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="text-green-600 mt-1" size={20} />
            <div>
              <p className="text-xs text-gray-500">{t('Officer Email', 'अधिकाऱ्यांचा ई-मेल')}</p>
              <a href={`mailto:${settings.officer_email}`} className="font-semibold text-green-600">
                {settings.officer_email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {Object.entries(groupedContacts).map(([type, items]) => (
            <div key={type} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">{getContactTypeIcon(type)}</span>
                {t(type, type)} {t('Contacts', 'संपर्क')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((contact) => {
                  const label = language === 'mr' && contact.label_mr ? contact.label_mr : contact.label;
                  const colorClass = getContactTypeColor(contact.contact_type);
                  
                  return (
                    <div
                      key={contact.id}
                      className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${colorClass} text-white p-4`}>
                        <h3 className="text-xl font-bold">{label}</h3>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {contact.contact_person && (
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">👤</div>
                            <div>
                              <p className="text-xs text-gray-500">{t('Contact Person', 'संपर्क व्यक्ती')}</p>
                              <p className="font-semibold text-gray-800">{contact.contact_person}</p>
                            </div>
                          </div>
                        )}

                        {contact.phone && (
                          <div className="flex items-start gap-3">
                            <Phone size={20} className="text-green-600 mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">{t('Phone', 'फोन')}</p>
                              <a
                                href={`tel:${contact.phone}`}
                                className="font-bold text-green-600 hover:text-green-700 transition text-lg"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        )}

                        {contact.email && (
                          <div className="flex items-start gap-3">
                            <Mail size={20} className="text-blue-600 mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">{t('Email', 'ईमेल')}</p>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-blue-600 hover:text-blue-700 transition text-sm break-all"
                              >
                                {contact.email}
                              </a>
                            </div>
                          </div>
                        )}

                        {contact.address && (
                          <div className="flex items-start gap-3">
                            <MapPin size={20} className="text-red-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">{t('Address', 'पत्ता')}</p>
                              <p className="text-gray-700 text-sm">{contact.address}</p>
                            </div>
                          </div>
                        )}

                        {contact.timings && (
                          <div className="flex items-start gap-3">
                            <Clock size={20} className="text-purple-600 mt-1" />
                            <div>
                              <p className="text-xs text-gray-500">{t('Timings', 'वेळ')}</p>
                              <p className="text-gray-700 text-sm">{contact.timings}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Location Map */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-12">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <MapPin size={28} />
            {t('Our Location', 'आमचे स्थान')}
          </h2>
        </div>
        <div className="p-6">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {settings.latitude && settings.longitude ? (
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15000!2d${settings.longitude}!3d${settings.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title={`Gram Panchayat ${villageName} Location`}
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('Map location not configured', 'नकाशा स्थान कॉन्फिगर केलेले नाही')}
              </div>
            )}
          </div>
          <p className="text-center text-gray-600 mt-4">
            {language === 'mr'
              ? (settings.office_address_mr || settings.office_address || noDataLabel)
              : language === 'hi'
                ? (settings.office_address_hi || settings.office_address_mr || settings.office_address || noDataLabel)
                : (settings.office_address || noDataLabel)}
          </p>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {t('Send Us a Message', 'आम्हाला संदेश पाठवा')}
        </h2>
        
        <form
          className="max-w-2xl mx-auto space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setFeedbackStatus('saving');
            const { error } = await supabase
              .from('cms_feedback_submissions')
              .insert({
                name: feedback.name,
                phone: feedback.phone || null,
                email: feedback.email || null,
                subject: feedback.subject,
                message: feedback.message,
                language
              });
            if (error) {
              console.error('Failed to submit feedback:', error);
              setFeedbackStatus('error');
              return;
            }
            setFeedbackStatus('success');
            setFeedback({ name: '', phone: '', email: '', subject: '', message: '' });
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t('Your Name', 'तुमचे नाव')} *
              </label>
              <input
                type="text"
                required
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('Enter your name', 'तुमचे नाव टाका')}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t('Mobile Number', 'मोबाईल नंबर')} *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={feedback.phone}
                onChange={(e) => setFeedback({ ...feedback, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Email Address', 'ईमेल पत्ता')}
            </label>
            <input
              type="email"
              value={feedback.email}
              onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Subject', 'विषय')} *
            </label>
            <input
              type="text"
              required
              value={feedback.subject}
              onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('What is this regarding?', 'हे कशाबद्दल आहे?')}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Message', 'संदेश')} *
            </label>
            <textarea
              required
              rows={5}
              value={feedback.message}
              onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Type your message here...', 'तुमचा संदेश येथे टाका...')}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-800">
              {t(
                'Your message will be reviewed by our team. For urgent matters, please call our helpline.',
                'तुमचा संदेश आमच्या टीमद्वारे पुनरावलोकन केला जाईल. तातडीच्या बाबींसाठी, कृपया आमच्या हेल्पलाइनवर कॉल करा.'
              )}
            </p>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={feedbackStatus === 'saving'}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition font-bold text-lg shadow-lg"
            >
              {feedbackStatus === 'saving'
                ? t('Sending...', 'पाठवत आहे...')
                : t('Send Message', 'संदेश पाठवा')}
            </button>
            {feedbackStatus === 'success' && (
              <p className="mt-4 text-green-700 font-semibold">
                {t('Your message was submitted successfully.', 'तुमचा संदेश यशस्वीरित्या पाठवला आहे.')}
              </p>
            )}
            {feedbackStatus === 'error' && (
              <p className="mt-4 text-red-700 font-semibold">
                {t('Submission failed. Please try again.', 'संदेश पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.')}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
