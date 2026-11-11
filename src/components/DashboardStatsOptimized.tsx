import { useState, useEffect } from 'react';
import { Users, TrendingUp, FileCheck, Building } from 'lucide-react';
import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { supabase } from '../lib/supabase';

interface DashboardStatsProps {
  language: Language;
}

interface StatItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  change: string;
  description: string;
  color: string;
}

const DashboardStats = ({ language }: DashboardStatsProps) => {
  const t = (en: string, mr: string) => language === 'mr' ? mr : en;
  const { settings } = useWebsiteSettings();
  const [dynamicStats, setDynamicStats] = useState<{
    works: number | null;
    schemes: number | null;
    services: number | null;
  }>({
    works: null,
    schemes: null,
    services: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active development works count
        const { count: worksCount, error: worksError } = await supabase
          .from('cms_development_works')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'In Progress');

        const { count: schemesCount, error: schemesError } = await supabase
          .from('cms_schemes')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (worksError) {
          console.error('Error fetching development works count:', worksError);
        }
        if (schemesError) {
          console.error('Error fetching schemes count:', schemesError);
        }

        setDynamicStats({
          works: worksError ? null : worksCount || null,
          schemes: schemesError ? null : schemesCount || null,
          services: null
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const noDataLabel = t('No data available', 'माहिती उपलब्ध नाही');
  const formatValue = (value: string | number | null) =>
    value === null || value === '' || value === 0 ? noDataLabel : String(value);

  const populationValue = formatValue(settings.population);
  const voterCount = formatValue(settings.voter_count);
  const maleVoters = formatValue(settings.male_voters);
  const femaleVoters = formatValue(settings.female_voters);
  const generalPopulation = formatValue(settings.general_population);
  const scPopulation = formatValue(settings.sc_population);
  const stPopulation = formatValue(settings.st_population);

  // Dynamic data
  const stats: StatItem[] = [
    {
      id: '1',
      title: t('Population', 'लोकसंख्या'),
      value: populationValue,
      icon: 'users',
      change: '',
      description: t('Total village population', 'एकूण गावातील लोकसंख्या'),
      color: 'blue'
    },
    {
      id: '2',
      title: t('General Population', 'General लोकसंख्या'),
      value: generalPopulation,
      icon: 'users',
      change: '',
      description: t('General category population', 'General प्रवर्गातील लोकसंख्या'),
      color: 'green'
    },
    {
      id: '3',
      title: t('SC Population', 'SC लोकसंख्या'),
      value: scPopulation,
      icon: 'users',
      change: '',
      description: t('Scheduled Caste population', 'अनुसूचित जाती लोकसंख्या'),
      color: 'purple'
    },
    {
      id: '4',
      title: t('ST Population', 'ST लोकसंख्या'),
      value: stPopulation,
      icon: 'users',
      change: '',
      description: t('Scheduled Tribe population', 'अनुसूचित जमाती लोकसंख्या'),
      color: 'orange'
    },
    {
      id: '5',
      title: t('Voters', 'मतदार संख्या'),
      value: voterCount,
      icon: 'users',
      change: '',
      description: t('Total registered voters', 'एकूण नोंदणीकृत मतदार'),
      color: 'purple'
    },
    {
      id: '6',
      title: t('Male Voters', 'पुरुष मतदार'),
      value: maleVoters,
      icon: 'users',
      change: '',
      description: t('Registered male voters', 'नोंदणीकृत पुरुष मतदार'),
      color: 'blue'
    },
    {
      id: '7',
      title: t('Female Voters', 'स्त्री मतदार'),
      value: femaleVoters,
      icon: 'users',
      change: '',
      description: t('Registered female voters', 'नोंदणीकृत स्त्री मतदार'),
      color: 'orange'
    },
    {
      id: '8',
      title: t('Development Works', 'विकास कामे'),
      value: formatValue(dynamicStats.works),
      icon: 'building',
      change: '',
      description: t('Active projects', 'सक्रिय प्रकल्प'),
      color: 'green'
    },
    {
      id: '9',
      title: t('Services', 'सेवा'),
      value: formatValue(dynamicStats.services),
      icon: 'file-check',
      change: '',
      description: t('Available services', 'उपलब्ध सेवा'),
      color: 'purple'
    },
    {
      id: '10',
      title: t('Schemes', 'योजना'),
      value: formatValue(dynamicStats.schemes),
      icon: 'trending-up',
      change: '',
      description: t('Government schemes', 'सरकारी योजना'),
      color: 'orange'
    }
  ];

  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'users': return <Users className="h-8 w-8" />;
      case 'building': return <Building className="h-8 w-8" />;
      case 'file-check': return <FileCheck className="h-8 w-8" />;
      case 'trending-up': return <TrendingUp className="h-8 w-8" />;
      default: return <FileCheck className="h-8 w-8" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'green': return 'bg-green-50 text-green-600 border-green-200';
      case 'purple': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'orange': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {t('Village at a Glance', 'गाव एक दृष्टीत')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 hover:shadow-xl transition-shadow h-full">
            <div className={`inline-flex p-3 rounded-lg mb-4 ${getColorClasses(stat.color)}`}>
              {getStatIcon(stat.icon)}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{stat.title}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                {stat.change && <span className="text-sm text-green-600 font-medium">{stat.change}</span>}
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;