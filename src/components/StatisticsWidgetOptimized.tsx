import { Users, Home, User, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

interface Statistic {
  stat_key: string;
  stat_value: string;
  stat_label: string;
  stat_label_mr?: string;
  icon_name?: string;
  display_order: number;
}

interface StatisticsWidgetProps {
  language: Language;
}

const StatisticsWidgetOptimized = ({ language }: StatisticsWidgetProps) => {
  const { settings } = useWebsiteSettings();
  
  const totalPop = settings.population?.replace(/,/g, '') || '';

  const stats: Statistic[] = [
    {
      stat_key: 'total_population',
      stat_value: totalPop,
      stat_label: 'Total Population',
      stat_label_mr: 'एकूण लोकसंख्या',
      display_order: 1
    },
    {
      stat_key: 'total_families',
      stat_value: settings.total_families,
      stat_label: 'Total Families',
      stat_label_mr: 'एकूण कुटुंबे',
      display_order: 2
    },
    {
      stat_key: 'general_population',
      stat_value: settings.general_population,
      stat_label: 'General Population',
      stat_label_mr: 'General लोकसंख्या',
      display_order: 3
    },
    {
      stat_key: 'sc_population',
      stat_value: settings.sc_population,
      stat_label: 'SC Population',
      stat_label_mr: 'SC लोकसंख्या',
      display_order: 4
    },
    {
      stat_key: 'st_population',
      stat_value: settings.st_population,
      stat_label: 'ST Population',
      stat_label_mr: 'ST लोकसंख्या',
      display_order: 5
    },
    {
      stat_key: 'male_population',
      stat_value: settings.male_population,
      stat_label: 'Male Population',
      stat_label_mr: 'पुरुष लोकसंख्या',
      display_order: 3
    },
    {
      stat_key: 'female_population',
      stat_value: settings.female_population,
      stat_label: 'Female Population',
      stat_label_mr: 'महिला लोकसंख्या',
      display_order: 4
    }
  ];

  const getIcon = (statKey: string) => {
    switch (statKey) {
      case 'total_population':
        return <Users className="text-orange-600" size={32} />;
      case 'total_families':
      case 'total_households':
        return <Home className="text-green-600" size={32} />;
      case 'male_population':
        return <User className="text-blue-600" size={32} />;
      case 'female_population':
        return <UserCheck className="text-pink-600" size={32} />;
      case 'general_population':
        return <Users className="text-green-600" size={32} />;
      case 'sc_population':
        return <User className="text-purple-600" size={32} />;
      case 'st_population':
        return <UserCheck className="text-orange-600" size={32} />;
      default:
        return <Users className="text-gray-600" size={32} />;
    }
  };

  const getGradient = (statKey: string) => {
    switch (statKey) {
      case 'total_population':
        return 'from-orange-500 to-orange-600';
      case 'total_families':
      case 'total_households':
        return 'from-green-500 to-green-600';
      case 'male_population':
        return 'from-blue-500 to-blue-600';
      case 'female_population':
        return 'from-pink-500 to-pink-600';
      case 'general_population':
        return 'from-green-500 to-green-600';
      case 'sc_population':
        return 'from-purple-500 to-purple-600';
      case 'st_population':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const t = (en: string, mr?: string) => (language === 'mr' && mr ? mr : en);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {stats.filter((stat) => stat.stat_value).map((stat) => (
        <div
          key={stat.stat_key}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full"
        >
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${getGradient(stat.stat_key)} p-4 flex items-center justify-between min-h-[110px]`}>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shrink-0">
              {getIcon(stat.stat_key)}
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                {Number(stat.stat_value.replace(/,/g, '')).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="p-4 min-h-[76px] flex items-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
              {t(stat.stat_label, stat.stat_label_mr)}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsWidgetOptimized;