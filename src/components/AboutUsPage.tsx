import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { MapPin } from 'lucide-react';

interface AboutUsPageProps {
  language: Language;
}

const AboutUsPage = ({ language }: AboutUsPageProps) => {
  const { settings, loading } = useWebsiteSettings();
  
  const t = (en: string, mr: string) => language === 'mr' ? mr : en;
  
  // Helper to get setting value with language
  const getSetting = (enKey: keyof typeof settings, mrKey?: keyof typeof settings) => {
    if (language === 'mr' && mrKey && settings[mrKey]) {
      return settings[mrKey];
    }
    return settings[enKey] || '';
  };

  const villageName = getSetting('village_name', 'village_name_mr');
  const district = getSetting('district', 'district_mr');
  const taluka = getSetting('taluka', 'taluka_mr');
  const state = getSetting('state', 'state_mr');
  const pincode = settings.pincode;
  const population = settings.population;
  const generalPopulation = settings.general_population;
  const scPopulation = settings.sc_population;
  const stPopulation = settings.st_population;
  const voterCount = settings.voter_count;
  const maleVoters = settings.male_voters;
  const femaleVoters = settings.female_voters;
  const areaSqKm = settings.area_sqkm;
  const latitude = settings.latitude;
  const longitude = settings.longitude;

  // About Us content
  const history = getSetting('about_history', 'about_history_mr');
  const geography = getSetting('about_geography', 'about_geography_mr');
  const culture = getSetting('about_culture', 'about_culture_mr');
  const economy = getSetting('about_economy', 'about_economy_mr');
  const sarpanchName = getSetting('sarpanch_name', 'sarpanch_name_mr');
  const sarpanchMessage = getSetting('sarpanch_message', 'sarpanch_message_mr');
  const sarpanchPhoto = settings.sarpanch_photo_url;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Village Information Section */}
      <section className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          {t(`About Gram Panchayat ${villageName}`, `ग्रामपंचायत ${villageName} बद्दल`)}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              {t('Village Profile', 'गाव प्रोफाइल')}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>{t('Village Name:', 'गावाचे नाव:')}</strong> {villageName || t('Not set', 'सेट नाही')}</p>
              <p><strong>{t('District:', 'जिल्हा:')}</strong> {district || t('Not set', 'सेट नाही')}</p>
              <p><strong>{t('Taluka:', 'तालुका:')}</strong> {taluka || t('Not set', 'सेट नाही')}</p>
              <p><strong>{t('State:', 'राज्य:')}</strong> {state || t('Maharashtra', 'महाराष्ट्र')}</p>
              {pincode && <p><strong>{t('PIN Code:', 'पिन कोड:')}</strong> {pincode}</p>}
              {areaSqKm && <p><strong>{t('Total Area:', 'एकूण क्षेत्र:')}</strong> {areaSqKm} {t('sq km', 'चौ.कि.मी.')}</p>}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              {t('Quick Facts', 'महत्त्वाची माहिती')}
            </h2>
            <div className="space-y-3 text-gray-700">
              {population && <p><strong>{t('Total Population:', 'एकूण लोकसंख्या:')}</strong> {population}</p>}
              {generalPopulation && <p><strong>{t('General Population:', 'General लोकसंख्या:')}</strong> {generalPopulation}</p>}
              {scPopulation && <p><strong>{t('SC Population:', 'SC लोकसंख्या:')}</strong> {scPopulation}</p>}
              {stPopulation && <p><strong>{t('ST Population:', 'ST लोकसंख्या:')}</strong> {stPopulation}</p>}
              {voterCount && <p><strong>{t('Voters:', 'मतदार संख्या:')}</strong> {voterCount}</p>}
              {maleVoters && <p><strong>{t('Male Voters:', 'पुरुष मतदार:')}</strong> {maleVoters}</p>}
              {femaleVoters && <p><strong>{t('Female Voters:', 'स्त्री मतदार:')}</strong> {femaleVoters}</p>}
              {settings.gram_panchayat_officer_name && (
                <p><strong>{t('Gram Panchayat Officer:', 'ग्रामपंचायत अधिकारी:')}</strong> {language === 'mr'
                  ? (settings.gram_panchayat_officer_name_mr || settings.gram_panchayat_officer_name)
                  : settings.gram_panchayat_officer_name}</p>
              )}
              {settings.officer_email && (
                <p><strong>{t('Officer Email:', 'अधिकाऱ्यांचा ई-मेल:')}</strong> {settings.officer_email}</p>
              )}
              <p><strong>{t('Contact:', 'संपर्क:')}</strong> {settings.phone_number || t('Not available', 'उपलब्ध नाही')}</p>
              <p><strong>{t('Email:', 'ईमेल:')}</strong> {settings.email || t('Not available', 'उपलब्ध नाही')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sarpanch Message Section */}
      {(sarpanchName || sarpanchMessage) && (
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t("Sarpanch's Message", 'सरपंचांचा संदेश')}
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {sarpanchPhoto && (
              <div className="flex-shrink-0">
                <img 
                  src={sarpanchPhoto} 
                  alt={String(sarpanchName)}
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
                />
              </div>
            )}
            <div>
              {sarpanchName && (
                <h3 className="text-xl font-semibold text-green-700 mb-2">{sarpanchName}</h3>
              )}
              {sarpanchMessage && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{sarpanchMessage}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* History Section */}
      {history && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t('Village History', 'गावाचा इतिहास')}
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed whitespace-pre-line">{history}</p>
          </div>
        </section>
      )}

      {/* Geography Section */}
      {geography && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t('Geography & Climate', 'भूगोल आणि हवामान')}
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed whitespace-pre-line">{geography}</p>
          </div>
        </section>
      )}

      {/* Culture Section */}
      {culture && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t('Culture & Traditions', 'संस्कृती आणि परंपरा')}
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed whitespace-pre-line">{culture}</p>
          </div>
        </section>
      )}

      {/* Economy Section */}
      {economy && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t('Economy & Livelihood', 'अर्थव्यवस्था आणि उपजीविका')}
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed whitespace-pre-line">{economy}</p>
          </div>
        </section>
      )}

      {/* Google Maps Section */}
      {latitude && longitude && (
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="h-8 w-8 text-red-500" />
            {t('Village Location', 'गावाचे स्थान')}
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1234567890`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${villageName} Location`}
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <p className="text-gray-600">
                <strong>{t('Coordinates:', 'निर्देशांक:')}</strong> {latitude}, {longitude}
              </p>
              <a 
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                {t('Open in Google Maps', 'Google Maps मध्ये पहा')}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {t('Contact Us', 'संपर्क करा')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-700">{t('Office Address', 'कार्यालय पत्ता')}</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {getSetting('office_address', 'office_address_mr') || t('Address not set', 'पत्ता सेट नाही')}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-700">{t('Contact Details', 'संपर्क माहिती')}</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>{t('Phone:', 'फोन:')}</strong> {settings.phone_number || t('Not available', 'उपलब्ध नाही')}</p>
              <p><strong>{t('Email:', 'ईमेल:')}</strong> {settings.email || t('Not available', 'उपलब्ध नाही')}</p>
              <p><strong>{t('Office Hours:', 'कार्यालयीन वेळ:')}</strong> {getSetting('office_hours', 'office_hours_mr') || t('Mon-Sat: 10 AM - 5 PM', 'सोम-शनि: सकाळी १० ते संध्या ५')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Show placeholder if no content is set */}
      {!history && !geography && !culture && !economy && !sarpanchMessage && (
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800">
            {t(
              'About Us content has not been configured yet. Please update the Website Settings in the admin panel.',
              'आमच्याबद्दल सामग्री अद्याप कॉन्फिगर केलेली नाही. कृपया प्रशासक पॅनेलमध्ये वेबसाइट सेटिंग्ज अपडेट करा.'
            )}
          </p>
        </section>
      )}
    </div>
  );
};

export default AboutUsPage;