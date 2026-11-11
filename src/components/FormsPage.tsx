import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { Language } from '../types';
import { supabase } from '../lib/supabase';

interface DownloadItem {
  id: string;
  document_name: string;
  category: string;
  file_url: string;
}

interface FormsPageProps {
  language: Language;
}

const FormsPage = ({ language }: FormsPageProps) => {
  const t = (en: string, mr: string) => language === 'mr' ? mr : en;
  const [forms, setForms] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_downloads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(forms.map(f => f.category).filter(Boolean))];

  const filteredForms = selectedCategory === 'All' 
    ? forms 
    : forms.filter(f => f.category === selectedCategory);

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        {t('Download Forms', 'फॉर्म डाउनलोड')}
      </h1>
      <p className="text-gray-600 mb-8">
        {t('Download and print application forms for various services', 'विविध सेवांसाठी अर्ज फॉर्म डाउनलोड आणि प्रिंट करा')}
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === category
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">
            {t('No downloadable forms available yet.', 'अद्याप डाउनलोड करण्यासाठी फॉर्म उपलब्ध नाहीत.')}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg flex-shrink-0">
                  <FileText size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-2">{form.document_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    {form.category && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{form.category}</span>
                    )}
                  </div>
                  <a
                    href={form.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {t('Download', 'डाउनलोड')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          {t('How to Use Forms', 'फॉर्म कसे वापरावे')}
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>{t('Download the required form', 'आवश्यक फॉर्म डाउनलोड करा')}</li>
          <li>{t('Print the form on A4 size paper', 'A4 आकाराच्या कागदावर फॉर्म प्रिंट करा')}</li>
          <li>{t('Fill all details clearly in block letters', 'सर्व तपशील स्पष्टपणे ब्लॉक अक्षरात भरा')}</li>
          <li>{t('Attach required documents', 'आवश्यक कागदपत्रे जोडा')}</li>
          <li>{t('Submit to Gram Panchayat office', 'ग्रामपंचायत कार्यालयात सबमिट करा')}</li>
        </ol>
      </div>
    </div>
  );
};

export default FormsPage;
