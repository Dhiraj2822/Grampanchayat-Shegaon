import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface BPLFamily {
  id: string;
  family_head_name: string;
  family_head_name_mr?: string;
  bpl_card_number: string;
  family_members: number;
  annual_income: number;
  address: string;
  address_mr?: string;
  category: 'apl' | 'bpl' | 'aay';
  ration_card_type: string;
  verification_date: string;
}

interface BPLListPageProps {
  language: Language;
  onBack: () => void;
}

const BPLListPage = ({ language, onBack }: BPLListPageProps) => {
  const [families, setFamilies] = useState<BPLFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_bpl_families')
        .select('*')
        .order('family_head_name', { ascending: true });

      if (error) throw error;
      setFamilies(data || []);
    } catch (error) {
      console.error('Error fetching BPL families:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: t('All Categories', 'सर्व श्रेणी'), color: 'bg-gray-100 text-gray-700' },
    { value: 'aay', label: t('Antyodaya (AAY)', 'अंत्योदय'), color: 'bg-red-100 text-red-700' },
    { value: 'bpl', label: t('Below Poverty Line (BPL)', 'गरीबी रेषेखाली'), color: 'bg-orange-100 text-orange-700' },
    { value: 'apl', label: t('Above Poverty Line (APL)', 'गरीबी रेषेवर'), color: 'bg-green-100 text-green-700' },
  ];

  const filteredFamilies = families.filter(family => {
    const categoryMatch = selectedCategory === 'all' || family.category === selectedCategory;
    const searchMatch = searchTerm === '' ||
      family.family_head_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.bpl_card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (family.family_head_name_mr && family.family_head_name_mr.includes(searchTerm));
    return categoryMatch && searchMatch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'aay':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'bpl':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'apl':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const exportToCSV = () => {
    const headers = ['Card Number', 'Family Head', 'Members', 'Annual Income', 'Category', 'Address'];
    const rows = filteredFamilies.map(family => [
      family.bpl_card_number,
      family.family_head_name,
      family.family_members,
      family.annual_income,
      family.category.toUpperCase(),
      family.address,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bpl_list.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>{t('Back', 'मागे')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('BPL/APL Family List', 'BPL/APL कुटुंब यादी')}
          </h1>
          <p className="text-teal-100">
            {t('List of families below and above poverty line', 'गरीबी रेषेखालील आणि वरील कुटुंबांची यादी')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('About BPL/APL Classification', 'BPL/APL वर्गीकरण बद्दल')}
          </h3>
          <p className="text-blue-800">
            {t(
              'Families are classified based on annual income, assets, and socio-economic conditions. AAY (Antyodaya) cardholders are the poorest of poor, BPL families fall below poverty line, and APL families are above poverty line.',
              'कुटुंबांचे वर्गीकरण वार्षिक उत्पन्न, मालमत्ता आणि सामाजिक-आर्थिक परिस्थितीवर आधारित केले जाते. AAY (अंत्योदय) कार्डधारक हे सर्वात गरीब आहेत, BPL कुटुंबे गरीबी रेषेखाली येतात आणि APL कुटुंबे गरीबी रेषेवर आहेत.'
            )}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('Search by name or card number...', 'नाव किंवा कार्ड क्रमांकाद्वारे शोधा...')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
            >
              <Download size={18} />
              {t('Export CSV', 'CSV निर्यात करा')}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Total Families', 'एकूण कुटुंबे')}</p>
            <p className="text-2xl font-bold text-gray-900">{filteredFamilies.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-red-600 mb-1">{t('AAY Families', 'अंत्योदय')}</p>
            <p className="text-2xl font-bold text-red-700">{families.filter(f => f.category === 'aay').length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <p className="text-sm text-orange-600 mb-1">{t('BPL Families', 'BPL')}</p>
            <p className="text-2xl font-bold text-orange-700">{families.filter(f => f.category === 'bpl').length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600 mb-1">{t('APL Families', 'APL')}</p>
            <p className="text-2xl font-bold text-green-700">{families.filter(f => f.category === 'apl').length}</p>
          </div>
        </div>

        {/* Families List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('Loading families...', 'कुटुंबे लोड होत आहेत...')}</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t('No families found', 'कोणतीही कुटुंबे आढळली नाहीत')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Card Number', 'कार्ड क्रमांक')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Family Head', 'कुटुंब प्रमुख')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Members', 'सदस्य')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Annual Income', 'वार्षिक उत्पन्न')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Category', 'श्रेणी')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">{t('Address', 'पत्ता')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFamilies.map((family) => (
                    <tr key={family.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{family.bpl_card_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">
                          {language === 'mr' && family.family_head_name_mr ? family.family_head_name_mr : family.family_head_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-gray-700">{family.family_members}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">₹{family.annual_income.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(family.category)}`}>
                          {family.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {language === 'mr' && family.address_mr ? family.address_mr : family.address}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            {t('Privacy Notice', 'गोपनीयता सूचना')}
          </h3>
          <p className="text-yellow-800">
            {t(
              'This information is published for transparency and verification purposes. Personal data should not be misused. For corrections or queries, contact the Gram Panchayat office.',
              'ही माहिती पारदर्शकता आणि सत्यापनासाठी प्रकाशित केली आहे. वैयक्तिक डेटाचा गैरवापर केला जाऊ नये. सुधारणा किंवा प्रश्नांसाठी ग्रामपंचायत कार्यालयाशी संपर्क साधा.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BPLListPage;
