import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GPStaff, Language } from '../types';

interface StaffPageProps {
  language: Language;
}

const StaffPage = ({ language }: StaffPageProps) => {
  const [staff, setStaff] = useState<GPStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_staff')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('Loading...', 'लोड होत आहे...')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        {t('Gram Panchayat Staff', 'ग्रामपंचायत कर्मचारी')}
      </h1>

      {staff.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">
            {t('No staff information available.', 'कर्मचारी माहिती उपलब्ध नाही.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto border-4 border-white bg-blue-200 flex items-center justify-center">
                    <User size={64} className="text-blue-600" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  {language === 'mr' && member.name_mr ? member.name_mr : member.name}
                </h3>
                <p className="text-center text-blue-600 font-semibold mb-4">
                  {member.designation}
                </p>

                <div className="space-y-3">
                  {member.mobile && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone size={18} className="text-green-600 flex-shrink-0" />
                      <a href={`tel:${member.mobile}`} className="hover:text-green-600">
                        {member.mobile}
                      </a>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail size={18} className="text-green-600 flex-shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:text-green-600 break-all">
                        {member.email}
                      </a>
                    </div>
                  )}

                  {member.department && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">
                        {member.department}
                      </span>
                    </div>
                  )}
                </div>

                {member.responsibilities && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      {t('Responsibilities:', 'जबाबदाऱ्या:')}
                    </p>
                    <p className="text-sm text-gray-700">
                      {member.responsibilities}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
