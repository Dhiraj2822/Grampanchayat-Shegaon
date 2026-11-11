import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Committee, Language } from '../types';

interface CommitteesPageProps {
  language: Language;
}

const CommitteesPage = ({ language }: CommitteesPageProps) => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_committees')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCommittees(data || []);
    } catch (error) {
      console.error('Error fetching committees:', error);
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
        {t('Gram Panchayat Committees', 'ग्रामपंचायत समित्या')}
      </h1>

      {committees.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Users size={48} className="mx-auto text-yellow-600 mb-4" />
          <p className="text-yellow-800">
            {t('Committee information will be available soon.', 'समिती माहिती लवकरच उपलब्ध होईल.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committees.map((committee) => (
            <div key={committee.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {language === 'mr' && committee.name_mr ? committee.name_mr : committee.name}
                  </h3>
                  {committee.description && (
                    <p className="text-gray-600 mb-4">
                      {committee.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {committee.formation_date && (
                      <div>
                        <span className="font-semibold">{t('Formed:', 'स्थापना:')}</span> {new Date(committee.formation_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitteesPage;
