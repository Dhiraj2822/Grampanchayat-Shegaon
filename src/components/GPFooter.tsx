import { Phone, Mail, MapPin, Facebook, Twitter, Youtube, ExternalLink, Instagram } from 'lucide-react';
import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface GPFooterProps {
  language: Language;
  onNavigate?: (page: string) => void;
}

const GPFooter = ({ language, onNavigate }: GPFooterProps) => {
  const t = (en: string, mr: string) => language === 'mr' ? mr : en;
  const { settings } = useWebsiteSettings();

  // Get dynamic values
  const villageName = language === 'mr' 
    ? (settings.village_name_mr || settings.village_name || 'गाव')
    : (settings.village_name || 'Village');
  
  const officeAddress = language === 'mr'
    ? (settings.office_address_mr || settings.office_address || '')
    : (settings.office_address || '');
  const noDataLabel = t('No data available', 'माहिती उपलब्ध नाही');

  const handleLinkClick = (path: string) => {
    if (onNavigate) {
      // Map footer paths to internal page names
      const pageMap: Record<string, string> = {
        '/': 'home',
        '/about': 'about',
        '/administration': 'admin-dashboard',
        '/services': 'forms',
        '/development': 'development',
        '/schemes': 'schemes',
        '/services/pay-tax': 'pay-tax',
        '/services/certificates': 'certificates',
        '/services/grievances': 'grievance',
        '/transparency/rti': 'rti',
        '/development/tenders': 'tenders',
        '/gallery': 'gallery',
      };
      const page = pageMap[path] || 'home';
      onNavigate(page);
    } else {
      window.location.href = path;
    }
  };

  const quickLinks = [
    { label: t('Home', 'मुख्यपृष्ठ'), path: '/' },
    { label: t('About Us', 'आमच्याबद्दल'), path: '/about' },
    { label: t('Administration', 'प्रशासन'), path: '/administration' },
    { label: t('Citizen Services', 'नागरिक सुविधा'), path: '/services' },
    { label: t('Development Works', 'विकासकामे'), path: '/development' },
    { label: t('Schemes', 'योजना'), path: '/schemes' },
  ];

  const importantLinks = [
    // { label: t('Pay Tax Online', 'कर भरा'), path: '/services/pay-tax' },
    { label: t('Apply for Certificate', 'प्रमाणपत्र'), path: '/services/certificates' },
    { label: t('Submit Grievance', 'तक्रार नोंदवा'), path: '/services/grievances' },
    { label: t('RTI', 'माहिती अधिकार'), path: '/transparency/rti' },
    { label: t('Tenders', 'निविदा'), path: '/development/tenders' },
    { label: t('Gallery', 'छायाचित्रे'), path: '/gallery' },
  ];

  const externalLinks = [
    { label: 'eGramSwaraj', url: 'https://egramswaraj.gov.in' },
    { label: 'Maha eGram', url: 'https://mahaegram.gov.in' },
    { label: 'Aaple Sarkar', url: 'https://aaplesarkar.mahaonline.gov.in' },
    { label: 'Digital India', url: 'https://digitalindia.gov.in' },
  ];

  return (
    <footer className="gp-footer bg-gradient-to-b from-gray-800 to-gray-900 text-white mt-16">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 pb-2 inline-block">
              {t('About Us', 'आमच्याबद्दल')}
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {t(
                `Gram Panchayat ${villageName} is committed to transparent governance and citizen-centric services through digital innovation.`,
                `ग्रामपंचायत ${villageName} डिजिटल नवकल्पनाद्वारे पारदर्शक शासन आणि नागरिक-केंद्रित सेवांसाठी वचनबद्ध आहे.`
              )}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition">
                  <Facebook size={20} />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="bg-blue-400 p-2 rounded-full hover:bg-blue-500 transition">
                  <Twitter size={20} />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition">
                  <Youtube size={20} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-pink-600 p-2 rounded-full hover:bg-pink-700 transition">
                  <Instagram size={20} />
                </a>
              )}
              {!settings.facebook_url && !settings.twitter_url && !settings.youtube_url && !settings.instagram_url && (
                <span className="text-gray-500 text-sm">{t('Social media links not set', 'सोशल मीडिया लिंक सेट नाहीत')}</span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 pb-2 inline-block">
              {t('Quick Links', 'द्रुत दुवे')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleLinkClick(link.path)}
                    className="text-gray-300 hover:text-green-400 transition flex items-center gap-2 bg-none border-none cursor-pointer"
                  >
                    <span className="text-green-500">▸</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 pb-2 inline-block">
              {t('Important Services', 'महत्वाच्या सेवा')}
            </h3>
            <ul className="space-y-2">
              {importantLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleLinkClick(link.path)}
                    className="text-gray-300 hover:text-green-400 transition flex items-center gap-2 bg-none border-none cursor-pointer"
                  >
                    <span className="text-green-500">▸</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 pb-2 inline-block">
              {t('Contact Us', 'संपर्क करा')}
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-green-500 flex-shrink-0 mt-1" />
                <span>
                  {officeAddress || noDataLabel}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-green-500" />
                <span>{settings.phone_number || noDataLabel}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-green-500" />
                <span>{settings.email || noDataLabel}</span>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                {t('External Links:', 'बाह्य दुवे:')}
              </p>
              <ul className="space-y-1">
                {externalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-green-400 transition flex items-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} className="text-green-500" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div>
            © 2025 {t(`Gram Panchayat ${villageName}. All rights reserved.`, `ग्रामपंचायत ${villageName}. सर्व हक्क राखीव.`)}
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white transition">
              {t('Privacy Policy', 'गोपनीयता धोरण')}
            </a>
            <a href="/terms" className="hover:text-white transition">
              {t('Terms of Use', 'वापराच्या अटी')}
            </a>
            <a href="/sitemap" className="hover:text-white transition">
              {t('Sitemap', 'साइटमॅप')}
            </a>
          </div>
          <div className="text-xs">
            {t('Visitor Count:', 'भेट देणारे:')} <span className="font-mono">12,456</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GPFooter;
