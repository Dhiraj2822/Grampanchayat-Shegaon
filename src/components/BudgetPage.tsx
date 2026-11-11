import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, IndianRupee, TrendingUp, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface BudgetDocument {
  id: string;
  year: string;
  document_type: 'budget' | 'audit' | 'annual_report';
  title: string;
  title_mr?: string;
  total_income: number;
  total_expenditure: number;
  document_url?: string;
  upload_date: string;
}

interface BudgetPageProps {
  language: Language;
  onBack: () => void;
}

const BudgetPage = ({ language, onBack }: BudgetPageProps) => {
  const [documents, setDocuments] = useState<BudgetDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_budget_documents')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { value: 'all', label: t('All Documents', 'सर्व दस्तऐवज') },
    { value: 'budget', label: t('Budget', 'अर्थसंकल्प') },
    { value: 'audit', label: t('Audit Reports', 'लेखापरीक्षण अहवाल') },
    { value: 'annual_report', label: t('Annual Reports', 'वार्षिक अहवाल') },
  ];

  const filteredDocuments = documents.filter(doc => {
    if (selectedType === 'all') return true;
    return doc.document_type === selectedType;
  });

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'audit':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'annual_report':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>{t('Back', 'मागे')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Budget & Audit Reports', 'अर्थसंकल्प व लेखापरीक्षण')}
          </h1>
          <p className="text-indigo-100">
            {t('Financial transparency and accountability documents', 'आर्थिक पारदर्शकता आणि जबाबदारी दस्तऐवज')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Type Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {documentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedType === type.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('Loading documents...', 'दस्तऐवज लोड होत आहेत...')}</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t('No documents found', 'कोणतेही दस्तऐवज आढळले नाहीत')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-indigo-500">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Document Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <FileText className="text-indigo-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(doc.document_type)}`}>
                            {doc.document_type === 'budget' && t('BUDGET', 'अर्थसंकल्प')}
                            {doc.document_type === 'audit' && t('AUDIT', 'लेखापरीक्षण')}
                            {doc.document_type === 'annual_report' && t('ANNUAL REPORT', 'वार्षिक अहवाल')}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">{doc.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {language === 'mr' && doc.title_mr ? doc.title_mr : doc.title}
                        </h3>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="text-green-600" size={18} />
                          <p className="text-xs text-green-700 font-medium">{t('Total Income', 'एकूण उत्पन्न')}</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{formatAmount(doc.total_income)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="text-red-600" size={18} />
                          <p className="text-xs text-red-700 font-medium">{t('Total Expenditure', 'एकूण खर्च')}</p>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{formatAmount(doc.total_expenditure)}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="text-blue-600" size={18} />
                          <p className="text-xs text-blue-700 font-medium">{t('Surplus/Deficit', 'शिल्लक/तूट')}</p>
                        </div>
                        <p className={`text-2xl font-bold ${doc.total_income >= doc.total_expenditure ? 'text-blue-700' : 'text-red-700'}`}>
                          {formatAmount(doc.total_income - doc.total_expenditure)}
                        </p>
                      </div>
                    </div>

                    {/* Upload Date */}
                    <p className="text-sm text-gray-500">
                      {t('Uploaded on:', 'अपलोड केले:')} {new Date(doc.upload_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  {/* Download Button */}
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {doc.document_url ? (
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        <Download size={18} />
                        {t('Download', 'डाउनलोड')}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                      >
                        <Download size={18} />
                        {t('No Document', 'दस्तऐवज नाही')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            {t('Financial Transparency', 'आर्थिक पारदर्शकता')}
          </h3>
          <p className="text-yellow-800">
            {t(
              'All budget and audit documents are made available for public scrutiny as per Gram Panchayat regulations and RTI Act. Citizens can download and review these documents to ensure accountability in public spending.',
              'ग्रामपंचायत नियम आणि RTI कायद्यानुसार सर्व अर्थसंकल्प आणि लेखापरीक्षण दस्तऐवज सार्वजनिक तपासणीसाठी उपलब्ध केले जातात. नागरिक सार्वजनिक खर्चात जबाबदारी सुनिश्चित करण्यासाठी ही दस्तऐवज डाउनलोड आणि पुनरावलोकन करू शकतात.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
