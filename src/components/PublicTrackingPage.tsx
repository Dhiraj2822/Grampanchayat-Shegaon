import { useState } from 'react';
import { Search, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface Props {
  language: Language;
}

interface TrackingRecord {
  reference_type: string;
  reference_number: string;
  status: string;
  subject: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

const PublicTrackingPage = ({ language }: Props) => {
  const [type, setType] = useState('grievance');
  const [number, setNumber] = useState('');
  const [record, setRecord] = useState<TrackingRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (en: string, mr: string, hi: string) =>
    language === 'mr' ? mr : language === 'hi' ? hi : en;

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSearched(true);
    setRecord(null);
    const { data, error } = await supabase.rpc('lookup_public_tracking', {
      p_reference_type: type,
      p_reference_number: number.trim()
    });
    if (!error && data?.length) setRecord(data[0] as TrackingRecord);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {t('Application Status', 'अर्जाची स्थिती', 'आवेदन स्थिति')}
      </h1>
      <p className="text-gray-600 mb-6">
        {t('Track a grievance or RTI application using its reference number.', 'तिकिट किंवा RTI अर्ज क्रमांक वापरून स्थिती पहा.', 'टिकट या RTI आवेदन संख्या से स्थिति देखें।')}
      </p>
      <form onSubmit={lookup} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('Reference type', 'प्रकार', 'प्रकार')}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="grievance">{t('Grievance', 'तक्रार', 'शिकायत')}</option>
            <option value="rti">RTI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('Reference number', 'क्रमांक', 'संदर्भ संख्या')}</label>
          <input value={number} onChange={(e) => setNumber(e.target.value)} required className="w-full border rounded-lg px-3 py-2" placeholder="GRV... / RTI..." />
        </div>
        <button type="submit" disabled={loading} className="bg-green-700 text-white rounded-lg px-5 py-3 flex items-center gap-2">
          <Search size={18} />
          {loading ? t('Checking...', 'तपासत आहे...', 'जाँच हो रही है...') : t('Check Status', 'स्थिती पहा', 'स्थिति देखें')}
        </button>
      </form>

      {searched && !loading && !record && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-5 text-yellow-800">
          {t('No matching reference was found.', 'जुळणारा क्रमांक आढळला नाही.', 'कोई मिलती हुई संदर्भ संख्या नहीं मिली।')}
        </div>
      )}
      {record && (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3">
            {record.status.toLowerCase().includes('resolved') || record.status.toLowerCase().includes('completed') ? (
              <CheckCircle className="text-green-600" />
            ) : (
              <Clock className="text-orange-600" />
            )}
            <div>
              <p className="text-sm text-gray-500">{record.reference_number}</p>
              <p className="text-xl font-bold text-gray-900">{record.status}</p>
            </div>
          </div>
          {record.subject && <p className="mt-4"><strong>{t('Subject', 'विषय', 'विषय')}:</strong> {record.subject}</p>}
          {record.resolution_note && <p className="mt-2"><strong>{t('Response', 'प्रतिसाद', 'प्रतिक्रिया')}:</strong> {record.resolution_note}</p>}
        </div>
      )}
    </div>
  );
};

export default PublicTrackingPage;
