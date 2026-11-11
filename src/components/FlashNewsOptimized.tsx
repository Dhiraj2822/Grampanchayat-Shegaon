import { Bell, AlertCircle, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FlashNews as FlashNewsType, Language } from '../types';
import { supabase } from '../lib/supabase';

interface FlashNewsProps {
  language: Language;
}

const FlashNewsOptimized = ({ language }: FlashNewsProps) => {
  const [news, setNews] = useState<FlashNewsType[]>([]);
  useEffect(() => {
    fetchNews();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_flash_news')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flash news:', error);
      } else {
        setNews((data || []).map((item) => ({
          ...item,
          news_text: item.title,
          priority: String(item.priority ?? 0),
          news_type: item.status || undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching flash news:', error);
    }
  };

  const getNewsIcon = (type?: string) => {
    switch (type) {
      case 'Meeting':
        return Calendar;
      case 'Alert':
        return AlertCircle;
      case 'Tender':
        return FileText;
      default:
        return Bell;
    }
  };

  const getNewsColor = (type?: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-blue-500';
      case 'Alert':
        return 'bg-red-500';
      case 'Tender':
        return 'bg-green-500';
      default:
        return 'bg-orange-500';
    }
  };

  const t = (en: string, mr?: string) => language === 'mr' && mr ? mr : en;

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-red-500" size={20} />
        <h2 className="text-xl font-bold text-gray-800">
          {t('Flash News', 'ताज्या बातम्या')}
        </h2>
      </div>

      <div className="space-y-3">
        {news.map((item) => {
          const IconComponent = getNewsIcon(item.news_type);
          return (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`${getNewsColor(item.news_type)} p-2 rounded-full`}>
                <IconComponent className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {t(item.news_text || '', item.news_text_mr || '')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashNewsOptimized;