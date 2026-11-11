import { useState } from 'react';
import { Search, FileText, DollarSign, Calendar, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface PropertyTaxRecord {
  id: string;
  property_id: string;
  owner_name: string;
  owner_name_mr?: string;
  ward_number?: number;
  property_address?: string;
  property_type?: string;
  annual_tax_amount: number;
  arrears: number;
  total_due: number;
  last_paid_date?: string;
  mobile?: string;
}

interface WaterTaxRecord {
  id: string;
  connection_id: string;
  consumer_name: string;
  annual_charges: number;
  arrears: number;
  total_due: number;
  last_paid_date?: string;
}

interface TaxCheckPageProps {
  language: Language;
}

const TaxCheckPage = ({ language }: TaxCheckPageProps) => {
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyTaxRecord | null>(null);
  const [waterData, setWaterData] = useState<WaterTaxRecord | null>(null);
  const [error, setError] = useState('');

  const t = (en: string, mr: string) => (language === 'mr' ? mr : en);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId.trim()) {
      setError(t('Please enter a Property ID', 'कृपया मालमत्ता आयडी प्रविष्ट करा'));
      return;
    }

    setLoading(true);
    setError('');
    setPropertyData(null);
    setWaterData(null);
    setSearchPerformed(true);

    try {
      // Search property tax record
      const { data: propData, error: propError } = await supabase
        .from('property_tax')
        .select('*')
        .eq('property_id', propertyId.trim())
        .single();

      if (propError && propError.code !== 'PGRST116') {
        throw propError;
      }

      setPropertyData(propData);

      // Search water tax record by property_id (assuming connection_id matches property_id)
      const { data: waterData, error: waterError } = await supabase
        .from('water_tax')
        .select('*')
        .eq('connection_id', propertyId.trim())
        .single();

      if (waterError && waterError.code !== 'PGRST116') {
        throw waterError;
      }

      setWaterData(waterData);

      if (!propData && !waterData) {
        setError(t('No records found for this Property ID', 'या मालमत्ता आयडीसाठी कोणतेही रेकॉर्ड आढळले नाहीत'));
      }

    } catch (error) {
      console.error('Error searching tax records:', error);
      setError(t('Error fetching tax records. Please try again.', 'कर रेकॉर्ड मिळवताना त्रुटी. पुन्हा प्रयत्न करा.'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('Not Available', 'उपलब्ध नाही');
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalDues = (propertyData?.total_due || 0) + (waterData?.total_due || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Search size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {t('Check Tax Dues', 'कर थकबाकी तपासा')}
              </h1>
              <p className="text-blue-100 mt-1">
                {t('Enter your Property ID to check pending dues', 'आपली मालमत्ता आयडी प्रविष्ट करा')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow-lg p-6 -mt-4 mx-4 rounded-lg relative z-10">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Property ID / मालमत्ता आयडी', 'मालमत्ता आयडी')}
              </label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder={t('e.g., PROP/2024/001', 'उदा., PROP/2024/001')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('Searching...', 'शोधत आहे...')}
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    {t('Search', 'शोधा')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mt-6 flex items-center gap-3">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {searchPerformed && !loading && !error && (propertyData || waterData) && (
          <div className="mt-6 space-y-6">
            {/* Summary Card */}
            <div className={`rounded-xl shadow-lg p-6 ${totalDues > 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">
                    {t('Total Dues', 'एकूण थकबाकी')}
                  </p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(totalDues)}
                  </p>
                </div>
                {totalDues === 0 ? (
                  <CheckCircle size={48} className="text-white/80" />
                ) : (
                  <AlertCircle size={48} className="text-white/80" />
                )}
              </div>
              {totalDues === 0 && (
                <p className="mt-3 text-white/90">
                  {t('✓ All taxes are paid!', '✓ सर्व कर भरले आहेत!')}
                </p>
              )}
            </div>

            {/* Property Tax Details */}
            {propertyData && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={24} />
                    <h2 className="text-xl font-bold">
                      {t('Property Tax Details', 'मालमत्ता कर तपशील')}
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Owner Name', 'मालकाचे नाव')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {language === 'mr' && propertyData.owner_name_mr
                            ? propertyData.owner_name_mr
                            : propertyData.owner_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Ward Number', 'प्रभाग क्रमांक')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {propertyData.ward_number || t('N/A', 'नाही')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Property Type', 'मालमत्तेचा प्रकार')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {propertyData.property_type || t('Residential', 'निवासी')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Last Paid Date', 'शेवटची भरणा केलेली तारीख')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatDate(propertyData.last_paid_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Annual Tax', 'वार्षिक कर')}
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {formatCurrency(propertyData.annual_tax_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Arrears', 'थकबाकी')}
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(propertyData.arrears)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Total Due', 'एकूण देय')}
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(propertyData.total_due)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Water Tax Details */}
            {waterData && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <DollarSign size={24} />
                    <h2 className="text-xl font-bold">
                      {t('Water Tax Details', 'पाणी कर तपशील')}
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Consumer Name', 'ग्राहकाचे नाव')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {waterData.consumer_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('Last Paid Date', 'शेवटची भरणा केलेली तारीख')}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatDate(waterData.last_paid_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Annual Charges', 'वार्षिक शुल्क')}
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {formatCurrency(waterData.annual_charges)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Arrears', 'थकबाकी')}
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(waterData.arrears)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t('Total Due', 'एकूण देय')}
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(waterData.total_due)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {totalDues > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  {t('Pay your taxes online securely', 'आपले कर सुरक्षितपणे ऑनलाइन भरा')}
                </p>
                <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all inline-flex items-center gap-2">
                  <DollarSign size={20} />
                  {t('Pay Now', 'आता भरा')} - {formatCurrency(totalDues)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!searchPerformed && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle size={20} />
              {t('How to Check Tax Dues', 'कर थकबाकी कशी तपासावी')}
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• {t('Enter your Property ID in the search box above', 'वरील शोध बॉक्समध्ये आपली मालमत्ता आयडी प्रविष्ट करा')}</li>
              <li>• {t('Property ID format: PROP/2024/XXX', 'मालमत्ता आयडी स्वरूप: PROP/2024/XXX')}</li>
              <li>• {t('You will see both Property Tax and Water Tax dues if applicable', 'लागू असल्यास आपल्याला मालमत्ता कर आणि पाणी कर थकबाकी दोन्ही दिसतील')}</li>
              <li>• {t('For assistance, contact Gram Panchayat office', 'मदतीसाठी, ग्रामपंचायत कार्यालयाशी संपर्क साधा')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCheckPage;
