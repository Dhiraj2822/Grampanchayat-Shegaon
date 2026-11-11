import { Quote } from 'lucide-react';
import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface SarpanchMessageProps {
  language: Language;
}

const SarpanchMessage = ({ language }: SarpanchMessageProps) => {
  const { settings, loading } = useWebsiteSettings();

  // Get dynamic village name
  const villageName = language === 'mr' 
    ? (settings.village_name_mr || settings.village_name || 'गाव')
    : (settings.village_name || 'Village');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Use settings directly instead of fetching from a separate table
  // This ensures consistency with the CMS
  const sarpanchName = language === 'mr' ? (settings.sarpanch_name_mr || settings.sarpanch_name) : settings.sarpanch_name;
  const messageText = language === 'mr' ? (settings.sarpanch_message_mr || settings.sarpanch_message) : settings.sarpanch_message;
  const photoUrl = settings.sarpanch_photo_url;

  if (!messageText) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-xl p-8 mb-8 border-t-4 border-green-600">
      <div className="flex items-start gap-6">
        {photoUrl && (
          <div className="flex-shrink-0">
            <img
              src={photoUrl}
              alt={sarpanchName || 'Sarpanch'}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Quote className="text-green-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-800">
              {language === 'mr' ? 'सरपंच संदेश' : "Sarpanch's Message"}
            </h2>
          </div>
          
          <blockquote className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-green-500 pl-4 mb-4">
            {messageText}
          </blockquote>
          
          {sarpanchName && (
            <div className="text-right">
              <p className="text-gray-800 font-semibold text-lg">
                - {sarpanchName}
              </p>
              <p className="text-gray-600">
                {language === 'mr' ? `सरपंच, ग्रामपंचायत ${villageName}` : `Sarpanch, Gram Panchayat ${villageName}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SarpanchMessage;
