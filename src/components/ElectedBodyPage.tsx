import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ElectedBody, Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface ElectedBodyPageProps {
  language: Language;
}

const ElectedBodyPage = ({ language }: ElectedBodyPageProps) => {
  const [members, setMembers] = useState<ElectedBody[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useWebsiteSettings();

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  // Dynamic village name
  const villageName = language === 'mr' 
    ? (settings.village_name_mr || settings.village_name || 'गाव')
    : (settings.village_name || 'Village');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_elected_officials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDesignationColor = (designation: string) => {
    if (designation.toLowerCase().includes('sarpanch')) return 'from-green-600 to-green-700';
    if (designation.toLowerCase().includes('deputy')) return 'from-blue-600 to-blue-700';
    return 'from-purple-600 to-purple-700';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!members || members.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('Elected Body Members', 'निवडून आलेले सदस्य')}
        </h1>
        <p className="text-gray-600 text-lg mt-4">
          {t('No elected officials data available', 'निवडून आलेल्या अधिकाऱ्यांचा डेटा उपलब्ध नाही')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('Elected Body Members', 'निवडून आलेले सदस्य')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t(
            `Meet the democratically elected representatives of Gram Panchayat ${villageName}`,
            `ग्रामपंचायत ${villageName} च्या लोकशाही पद्धतीने निवडून आलेल्या प्रतिनिधींना भेटा`
          )}
        </p>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members && members.map((member) => {
          if (!member || !member.name || !member.designation) return null;
          
          const name = language === 'mr' && member.name_mr ? member.name_mr : member.name;
          const colorClass = getDesignationColor(member.designation || 'Member');
          
          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Header with designation */}
              <div className={`bg-gradient-to-r ${colorClass} text-white py-3 px-4`}>
                <h3 className="font-bold text-lg text-center">
                  {member.designation}
                </h3>
              </div>

              {/* Photo */}
              <div className="p-6 pb-4">
                <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-4xl text-white font-bold">
                        {name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  {name}
                </h2>

                {/* Ward Info */}
                {member.ward_number && (
                  <p className="text-center text-gray-600 mb-4">
                    {t('Ward', 'प्रभाग')} {member.ward_number}
                    {member.ward_name && ` - ${member.ward_name}`}
                  </p>
                )}

                {/* Contact Details */}
                <div className="space-y-2 border-t pt-4">
                  {member.mobile && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone size={18} className="text-green-600" />
                      <a href={`tel:${member.mobile}`} className="hover:text-green-600 transition">
                        {member.mobile}
                      </a>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail size={18} className="text-green-600" />
                      <a href={`mailto:${member.email}`} className="hover:text-green-600 transition text-sm">
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{member.address}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {member.education && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t('Education:', 'शिक्षण:')}</span> {member.education}
                    </p>
                  </div>
                )}

                {/* Term Info */}
                {member.term_start_date && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 text-center">
                      {t('Term:', 'कार्यकाळ:')} {new Date(member.term_start_date).getFullYear()} -{' '}
                      {member.term_end_date ? new Date(member.term_end_date).getFullYear() : t('Present', 'आत्तापर्यंत')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {t('No elected body members found.', 'निवडून आलेले सदस्य सापडले नाहीत.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ElectedBodyPage;
