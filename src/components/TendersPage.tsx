import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface Tender {
  id: string;
  tender_no: string;
  title: string;
  value?: number;
  status?: string;
  pdf_url?: string;
  created_at?: string;
}

interface TendersPageProps {
  language: Language;
  onBack: () => void;
}

const TendersPage = ({ language, onBack }: TendersPageProps) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenders(data || []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    open: 'bg-green-100 text-green-700 border-green-300',
    closed: 'bg-gray-100 text-gray-700 border-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  const filteredTenders = tenders.filter(tender => {
    if (selectedStatus === 'all') return true;
    return tender.status === selectedStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '—';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            {t('Government Tenders', 'सरकारी निविदा')}
          </h1>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('Filter by Status', 'स्थितीनुसार फिल्टर करा')}</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('All', 'सर्व')}
            </button>
            {['open', 'closed', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(status.charAt(0).toUpperCase() + status.slice(1), 
                  status === 'open' ? 'सुरू' : status === 'closed' ? 'बंद' : 'प्रलंबित')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('Loading tenders...', 'निविदा लोड होत आहेत...')}</p>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t('No tenders found', 'कोणतीही निविदा आढळली नाही')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Tender Number and Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
                        {tender.tender_no}
                      </span>
                      {tender.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tender.status] || statusColors['pending']}`}>
                          {t(tender.status.charAt(0).toUpperCase() + tender.status.slice(1),
                            tender.status === 'open' ? 'सुरू' : tender.status === 'closed' ? 'बंद' : 'प्रलंबित')}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {tender.title}
                    </h3>

                    {/* Value if available */}
                    {tender.value && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-gray-600">{t('Tender Value', 'निविदा मूल्य')}</p>
                        <p className="font-semibold text-blue-700 text-lg">{formatCurrency(tender.value)}</p>
                      </div>
                    )}

                    {/* Created Date */}
                    {tender.created_at && (
                      <p className="text-sm text-gray-500">
                        {t('Published on', 'प्रकाशित:')}{' '}
                        {formatDate(tender.created_at)}
                      </p>
                    )}
                  </div>

                  {/* Download Button */}
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {tender.pdf_url ? (
                      <a
                        href={tender.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <Download size={18} />
                        {t('Download', 'डाउनलोड')}
                      </a>
                    ) : (
                      <button
                        onClick={() => alert(t('Document not available', 'दस्तऐवज उपलब्ध नाही'))}
                        className="flex items-center justify-center gap-2 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                        disabled
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
      </div>
    </div>
  );
};

export default TendersPage;
