import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, IndianRupee, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface GPDPProject {
  id: string;
  title: string;
  title_mr?: string;
  description?: string;
  description_mr?: string;
  category: string;
  estimated_budget: number;
  year: string;
  priority: 'high' | 'medium' | 'low';
  status: 'proposed' | 'approved' | 'in_progress' | 'completed';
  created_at?: string;
}

interface GramPanchayatDevelopmentPlanPageProps {
  language: Language;
  onBack: () => void;
}

const GramPanchayatDevelopmentPlanPage = ({ language, onBack }: GramPanchayatDevelopmentPlanPageProps) => {
  const [projects, setProjects] = useState<GPDPProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('2024-25');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_gpdp_projects')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching GPDP projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: t('All Categories', 'सर्व प्रकार') },
    { value: 'roads', label: t('Roads & Transport', 'रस्ते व वाहतूक') },
    { value: 'water', label: t('Water Supply', 'पाणी पुरवठा') },
    { value: 'education', label: t('Education', 'शिक्षण') },
    { value: 'health', label: t('Health', 'आरोग्य') },
    { value: 'agriculture', label: t('Agriculture', 'शेती') },
    { value: 'sanitation', label: t('Sanitation', 'स्वच्छता') },
    { value: 'infrastructure', label: t('Infrastructure', 'पायाभूत सुविधा') },
  ];

  const years = ['2024-25', '2023-24', '2022-23'];

  const statusColors = {
    proposed: 'bg-gray-100 text-gray-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  const filteredProjects = projects.filter(project => {
    const yearMatch = selectedYear === 'all' || project.year === selectedYear;
    const categoryMatch = selectedCategory === 'all' || project.category === selectedCategory;
    return yearMatch && categoryMatch;
  });

  const totalBudget = filteredProjects.reduce((sum, project) => sum + project.estimated_budget, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>{t('Back', 'मागे')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Gram Panchayat Development Plan (GPDP)', 'ग्रामपंचायत विकास योजना')}
          </h1>
          <p className="text-green-100">
            {t('Participatory planning for village development', 'गावाच्या विकासासाठी सहभागी नियोजन')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Financial Year', 'आर्थिक वर्ष')}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">{t('All Years', 'सर्व वर्षे')}</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Category', 'प्रकार')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Total Budget */}
            <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('Total Budget', 'एकूण अर्थसंकल्प')}</p>
                <p className="text-2xl font-bold text-green-700">₹{(totalBudget / 100000).toFixed(2)}L</p>
              </div>
              <IndianRupee className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('Loading projects...', 'प्रकल्प लोड होत आहेत...')}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t('No projects found', 'कोणतेही प्रकल्प आढळले नाहीत')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="text-green-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {language === 'mr' && project.title_mr ? project.title_mr : project.title}
                        </h3>
                        {project.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {language === 'mr' && project.description_mr ? project.description_mr : project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {project.status === 'proposed' && t('Proposed', 'प्रस्तावित')}
                        {project.status === 'approved' && t('Approved', 'मंजूर')}
                        {project.status === 'in_progress' && t('In Progress', 'कार्यान्वित')}
                        {project.status === 'completed' && t('Completed', 'पूर्ण')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                        {project.priority === 'high' && t('High Priority', 'उच्च प्राधान्य')}
                        {project.priority === 'medium' && t('Medium Priority', 'मध्यम प्राधान्य')}
                        {project.priority === 'low' && t('Low Priority', 'कमी प्राधान्य')}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {project.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{project.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee size={16} />
                        <span className="font-semibold">₹{(project.estimated_budget / 100000).toFixed(2)} Lakhs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    {project.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={20} />
                        <span className="hidden md:inline">{t('Done', 'पूर्ण')}</span>
                      </div>
                    )}
                    {project.status === 'in_progress' && (
                      <div className="flex items-center gap-1 text-yellow-600 text-sm">
                        <Clock size={20} />
                        <span className="hidden md:inline">{t('Ongoing', 'सुरू')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {t('About GPDP', 'ग्रामपंचायत विकास योजना बद्दल')}
          </h3>
          <p className="text-blue-800 mb-2">
            {t(
              'The Gram Panchayat Development Plan (GPDP) is a comprehensive plan for economic development and social justice prepared through participatory process.',
              'ग्रामपंचायत विकास योजना ही सहभागी प्रक्रियेद्वारे तयार केलेली आर्थिक विकास आणि सामाजिक न्यायासाठी सर्वसमावेशक योजना आहे.'
            )}
          </p>
          <p className="text-blue-800">
            {t(
              'It includes projects for infrastructure, agriculture, education, health, and social welfare based on community needs and priorities.',
              'यात समाजाच्या गरजा आणि प्राधान्यक्रमांवर आधारित पायाभूत सुविधा, शेती, शिक्षण, आरोग्य आणि समाज कल्याणाच्या प्रकल्पांचा समावेश आहे.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GramPanchayatDevelopmentPlanPage;
