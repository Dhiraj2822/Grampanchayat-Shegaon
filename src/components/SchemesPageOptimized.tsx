import { useState, useEffect } from 'react';
import { Award, ExternalLink, Phone, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Scheme, Language } from '../types';

interface SchemesPageProps {
  language: Language;
}

const SchemesPageOptimized = ({ language }: SchemesPageProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_schemes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = filter === 'all' ? schemes : schemes.filter(scheme => scheme.scheme_type?.toLowerCase() === filter.toLowerCase());

  const getSchemeTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'central':
        return 'from-blue-600 to-blue-700';
      case 'state':
        return 'from-orange-600 to-orange-700';
      case 'local':
        return 'from-green-600 to-green-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getSchemeTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'central':
        return '🏛️';
      case 'state':
        return '🏢';
      case 'local':
        return '🏘️';
      default:
        return '📋';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {t('Government Schemes', 'सरकारी योजना')}
      </h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          { id: 'all', name: t('All Schemes', 'सर्व योजना') },
          { id: 'central', name: t('Central', 'केंद्र') },
          { id: 'state', name: t('State', 'राज्य') },
          { id: 'local', name: t('Local', 'स्थानिक') }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === filterOption.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-300'
            }`}
          >
            {filterOption.name}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${getSchemeTypeColor(scheme.scheme_type)} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{getSchemeTypeIcon(scheme.scheme_type)}</span>
                <span className="text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                  {scheme.scheme_type} Scheme
                </span>
              </div>
              <h3 className="text-lg font-bold mt-2">{scheme.scheme_name}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">{scheme.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">
                    {t('Active Scheme', 'सक्रिय योजना')}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-blue-600 mr-2 mt-1" />
                  <div>
                    <span className="font-medium text-gray-700">{t('Benefits:', 'फायदे:')}</span>
                    <p className="text-gray-600">{scheme.benefits}</p>
                  </div>
                </div>
                
                {scheme.helpline && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-600">{scheme.helpline}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedScheme(scheme)}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('View Details', 'तपशील पहा')}
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {!loading && filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('No schemes found for selected filter', 'निवडलेल्या फिल्टरसाठी कोणत्या योजना सापडल्या नाहीत')}</p>
        </div>
      )}

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${getSchemeTypeColor(selectedScheme.scheme_type)} p-6 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedScheme.scheme_name}</h2>
                  <p className="text-blue-100 mt-2">{selectedScheme.description}</p>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('Eligibility:', 'पात्रता:')}</h3>
                <p className="text-gray-600">{selectedScheme.eligibility_criteria}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('Benefits:', 'फायदे:')}</h3>
                <p className="text-gray-600">{selectedScheme.benefits}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('Application Process:', 'अर्ज प्रक्रिया:')}</h3>
                <p className="text-gray-600">{selectedScheme.how_to_apply}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">{t('Contact Information:', 'संपर्क माहिती:')}</h3>
                <div className="space-y-2">
                  {selectedScheme.helpline && (
                    <p className="text-gray-600">
                      <strong>{t('Helpline:', 'हेल्पलाइन:')}</strong> {selectedScheme.helpline}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  {t('Scheme is active and accepting applications', 'योजना सक्रिय आहे आणि अर्ज स्वीकारत आहे')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemesPageOptimized;