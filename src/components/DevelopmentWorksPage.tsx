import { useEffect, useState } from 'react';
import { Building2, Calendar, IndianRupee, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DevelopmentWork, Language } from '../types';

interface DevelopmentWorksPageProps {
  language: Language;
}

const DevelopmentWorksPage = ({ language }: DevelopmentWorksPageProps) => {
  const [works, setWorks] = useState<DevelopmentWork[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchWorks();
  }, [filter]);

  const fetchWorks = async () => {
    try {
      let query = supabase
        .from('cms_development_works')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter === 'Ongoing' ? 'In Progress' : filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'proposed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const tabs = [
    { id: 'all', label: t('All Works', 'सर्व कामे') },
    { id: 'Completed', label: t('Completed', 'पूर्ण झालेली') },
    { id: 'Ongoing', label: t('Ongoing', 'चालू') },
    { id: 'Proposed', label: t('Proposed', 'प्रस्तावित') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          {t('Development Works', 'विकासकामे')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('Track infrastructure and development projects in our village', 'आमच्या गावातील पायाभूत सुविधा आणि विकास प्रकल्पांचा मागोवा घ्या')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              filter === tab.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50 shadow'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Works Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {works.map((work) => {
            const workName = language === 'mr' && work.work_name_mr ? work.work_name_mr : work.work_name;
            
            return (
              <div key={work.id} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition">
                {/* Work Image or Placeholder */}
                {work.photo_urls?.[0] ? (
                  <img
                    src={work.photo_urls[0]}
                    alt={workName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <Building2 size={64} className="text-white opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Work ID & Status */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-mono text-gray-500">{work.work_id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(work.status)}`}>
                      {work.status}
                    </span>
                  </div>

                  {/* Work Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {workName}
                  </h3>

                  {/* Category & Location */}
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
                    {work.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded">{work.category}</span>
                    )}
                    {work.location && (
                      <span className="bg-gray-100 px-2 py-1 rounded">📍 {work.location}</span>
                    )}
                  </div>

                  {/* Description */}
                  {work.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{work.description}</p>
                  )}

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{t('Sanctioned Cost', 'मंजूर खर्च')}</p>
                      <p className="font-bold text-green-700 flex items-center gap-1">
                        <IndianRupee size={14} />
                        {work.sanctioned_cost?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {work.actual_cost && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('Actual Cost', 'वास्तविक खर्च')}</p>
                        <p className="font-bold text-blue-700 flex items-center gap-1">
                          <IndianRupee size={14} />
                          {work.actual_cost.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (for ongoing works) */}
                  {work.status === 'In Progress' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('Progress', 'प्रगती')}</span>
                        <span className="font-semibold text-blue-600">{work.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                          style={{ width: `${work.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Dates & Contractor */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    {work.start_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-green-600" />
                        <span>
                          {t('Started:', 'सुरुवात:')} {new Date(work.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {work.completion_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-blue-600" />
                        <span>
                          {t('Completed:', 'पूर्ण:')} {new Date(work.completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {work.contractor_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp size={16} className="text-purple-600" />
                        <span>
                          {t('Contractor:', 'कंत्राटदार:')} {work.contractor_name}
                        </span>
                      </div>
                    )}
                    {work.funding_source && (
                      <div className="text-xs text-gray-500 mt-2">
                        {t('Funding:', 'निधी:')} {work.funding_source}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && works.length === 0 && (
        <div className="text-center py-16">
          <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {t('No development works found.', 'विकासकामे सापडली नाहीत.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DevelopmentWorksPage;
