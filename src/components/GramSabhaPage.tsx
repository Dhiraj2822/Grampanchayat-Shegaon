import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface GramSabhaMeeting {
  id: string;
  meeting_number: string;
  meeting_date: string;
  agenda: string;
  agenda_mr?: string;
  decisions?: string;
  decisions_mr?: string;
  attendance: number;
  venue: string;
  minutes_document_url?: string;
  created_at?: string;
}

interface GramSabhaPageProps {
  language: Language;
  onBack: () => void;
}

const GramSabhaPage = ({ language, onBack }: GramSabhaPageProps) => {
  const [meetings, setMeetings] = useState<GramSabhaMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_gram_sabha_meetings')
        .select('*')
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (selectedYear === 'all') return true;
    return meeting.meeting_date.startsWith(selectedYear);
  });

  const years = ['all', ...Array.from(new Set(
    meetings
      .map((meeting) => meeting.meeting_date?.slice(0, 4))
      .filter((year): year is string => Boolean(year))
  ))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>{t('Back', 'मागे')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Gram Sabha Meetings', 'ग्रामसभा सभा')}
          </h1>
          <p className="text-purple-100">
            {t('Records of village assembly meetings and decisions', 'गाव सभांच्या सभा आणि निर्णयांची नोंद')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {t('About Gram Sabha', 'ग्रामसभा बद्दल')}
          </h3>
          <p className="text-blue-800 mb-2">
            {t(
              'Gram Sabha is the primary body of the Panchayati Raj system where all adult voters of the village participate in decision-making.',
              'ग्रामसभा ही पंचायतराज व्यवस्थेची प्राथमिक संस्था आहे जिथे गावातील सर्व प्रौढ मतदार निर्णय प्रक्रियेत सहभागी होतात.'
            )}
          </p>
          <p className="text-blue-800">
            {t(
              'Meetings are held at least twice a year to discuss development works, budgets, and village issues.',
              'विकासकामे, अर्थसंकल्प आणि गावातील समस्यांवर चर्चा करण्यासाठी वर्षातून किमान दोनदा सभा घेतली जाते.'
            )}
          </p>
        </div>

        {/* Year Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedYear === year
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year === 'all' ? t('All Years', 'सर्व वर्षे') : year}
              </button>
            ))}
          </div>
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('Loading meetings...', 'सभा लोड होत आहेत...')}</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t('No meetings found', 'कोणत्याही सभा आढळल्या नाहीत')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-purple-500">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Meeting Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <FileText className="text-purple-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {t('Gram Sabha Meeting', 'ग्रामसभा सभा')} #{meeting.meeting_number}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{formatDate(meeting.meeting_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>{meeting.attendance} {t('attendees', 'उपस्थित')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">{t('Venue:', 'स्थळ:')}</p>
                      <p className="text-gray-700">{meeting.venue}</p>
                    </div>

                    {/* Agenda */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {t('Agenda:', 'कार्यसूची:')}
                      </h4>
                      <p className="text-gray-600 whitespace-pre-line">
                        {language === 'mr' && meeting.agenda_mr ? meeting.agenda_mr : meeting.agenda}
                      </p>
                    </div>

                    {/* Decisions */}
                    {meeting.decisions && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          {t('Decisions Taken:', 'घेतलेले निर्णय:')}
                        </h4>
                        <p className="text-gray-600 whitespace-pre-line">
                          {language === 'mr' && meeting.decisions_mr ? meeting.decisions_mr : meeting.decisions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {meeting.minutes_document_url ? (
                      <a
                        href={meeting.minutes_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        <Download size={18} />
                        {t('Minutes', 'कार्यवृत्त')}
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
      </div>
    </div>
  );
};

export default GramSabhaPage;
