import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface Props {
  language: Language;
}

const GovernanceRecordsPage = ({ language }: Props) => {
  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const t = (en: string, mr: string, hi: string) =>
    language === 'mr' ? mr : language === 'hi' ? hi : en;

  useEffect(() => {
    const load = async () => {
      const queries = [
        ['infrastructure', supabase.from('cms_infrastructure_records').select('*').eq('is_active', true).limit(100)],
        ['education', supabase.from('cms_education_records').select('*').eq('is_active', true).limit(100)],
        ['employment', supabase.from('cms_employment_records').select('*').eq('is_active', true).limit(100)],
        ['environment', supabase.from('cms_environment_records').select('*').eq('is_active', true).limit(100)],
        ['hierarchy', supabase.from('cms_official_hierarchy').select('*').eq('is_active', true).order('display_order').limit(100)],
        ['wards', supabase.from('cms_ward_statistics').select('*').eq('is_active', true).limit(100)]
        ,['events', supabase.from('cms_events').select('*').eq('is_active', true).gte('start_at', new Date().toISOString()).order('start_at').limit(100)]
        ,['emergency', supabase.from('cms_emergency_contacts').select('*').eq('is_active', true).order('display_order').limit(100)]
        ,['impact', supabase.from('cms_impact_metrics').select('*').eq('is_active', true).order('display_order').limit(100)]
        ,['pledges', supabase.from('cms_sankalp_pledges').select('*').eq('is_active', true).order('pledge_number').limit(10)]
        ,['partnerships', supabase.from('cms_partnerships').select('*').eq('is_active', true).limit(100)]
        ,['stories', supabase.from('cms_beneficiary_stories').select('*').eq('is_active', true).limit(100)]
      ] as const;
      const responses = await Promise.all(queries.map(([, query]) => query));
      const next: Record<string, any[]> = {};
      queries.forEach(([key], index) => {
        next[key] = responses[index].data || [];
      });
      setRecords(next);
      setLoading(false);
    };
    load();
  }, []);

  const localized = (row: any, field: string) =>
    language === 'mr'
      ? row[`${field}_mr`] || row[field]
      : language === 'hi'
        ? row[`${field}_hi`] || row[`${field}_mr`] || row[field]
        : row[field];

  const sections = [
    ['infrastructure', t('Infrastructure & Facilities', 'पायाभूत सुविधा', 'बुनियादी सुविधाएं')],
    ['education', t('Education & Youth', 'शिक्षण आणि युवा', 'शिक्षा और युवा')],
    ['employment', t('Employment & Skills', 'रोजगार आणि कौशल्य', 'रोजगार और कौशल')],
    ['environment', t('Environment & Sustainability', 'पर्यावरण आणि टिकाऊपणा', 'पर्यावरण और स्थिरता')],
    ['hierarchy', t('Government Hierarchy', 'सरकारी पदानुक्रम', 'सरकारी पदानुक्रम')],
    ['wards', t('Ward-wise Statistics', 'प्रभागनिहाय आकडेवारी', 'वार्ड-वार आंकड़े')],
    ['events', t('Events & Calendar', 'कार्यक्रम आणि दिनदर्शिका', 'कार्यक्रम और कैलेंडर')],
    ['emergency', t('Emergency Contacts', 'तातडीचे संपर्क', 'आपातकालीन संपर्क')],
    ['impact', t('Impact Dashboard', 'प्रभाव पटल', 'प्रभाव डैशबोर्ड')],
    ['pledges', t('Samruddha Panchayat Sankalp', 'समृद्ध पंचायत संकल्प', 'समृद्ध पंचायत संकल्प')],
    ['partnerships', t('Partners & Collaboration', 'भागीदार आणि सहकार्य', 'साझेदार और सहयोग')],
    ['stories', t('Beneficiary Stories', 'लाभार्थी अनुभव', 'लाभार्थी कथाएँ')]
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {t('Village Progress & Public Information', 'गावाचा विकास आणि सार्वजनिक माहिती', 'गांव की प्रगति और सार्वजनिक जानकारी')}
      </h1>
      {loading ? (
        <p>{t('Loading...', 'लोड करत आहे...', 'लोड हो रहा है...')}</p>
      ) : (
        <div className="space-y-10">
          {sections.map(([key, title]) => (
            <section key={key} className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">{title}</h2>
              {records[key]?.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {records[key].map((row) => (
                    <article key={row.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">
                        {localized(row, 'title') || localized(row, 'metric_label') || row.name || row.ward_number || t('Record', 'नोंद', 'रिकॉर्ड')}
                      </h3>
                      {row.description && <p className="text-sm text-gray-600 mt-2">{localized(row, 'description')}</p>}
                      {row.category && <p className="text-sm text-gray-500 mt-2">{row.category}</p>}
                      {row.designation && <p className="text-sm text-gray-600 mt-1">{localized(row, 'designation')}</p>}
                      {row.population != null && <p className="text-sm mt-2">{t('Population', 'लोकसंख्या', 'जनसंख्या')}: {row.population}</p>}
                      {row.metric_value != null && <p className="text-lg font-bold text-green-700 mt-2">{row.metric_value} {row.metric_unit || ''}</p>}
                      {row.phone && <p className="text-sm mt-2"><a className="text-green-700" href={`tel:${row.phone}`}>{row.phone}</a></p>}
                      {row.start_at && <p className="text-sm text-gray-500 mt-2">{new Date(row.start_at).toLocaleString()}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('No data available', 'माहिती उपलब्ध नाही', 'जानकारी उपलब्ध नहीं है')}</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernanceRecordsPage;
