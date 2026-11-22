import { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../types';

interface PublicSearchProps {
  language: Language;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  page: string;
}

const PublicSearch = ({ language }: PublicSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const t = (en: string, mr: string, hi: string) =>
    language === 'mr' ? mr : language === 'hi' ? hi : en;

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    const pattern = `%${term}%`;
    const searches = await Promise.all([
      supabase.from('cms_schemes').select('id,scheme_name,description').or(`scheme_name.ilike.${pattern},description.ilike.${pattern}`).eq('is_active', true).limit(10),
      supabase.from('cms_development_works').select('id,project_name,description,status').or(`project_name.ilike.${pattern},description.ilike.${pattern}`).limit(10),
      supabase.from('cms_tenders').select('id,title,tender_no,status').or(`title.ilike.${pattern},tender_no.ilike.${pattern}`).limit(10),
      supabase.from('cms_flash_news').select('id,title,content,status').or(`title.ilike.${pattern},content.ilike.${pattern}`).limit(10),
      supabase.from('cms_downloads').select('id,document_name,category,file_url').or(`document_name.ilike.${pattern},category.ilike.${pattern}`).limit(10)
    ]);
    const found: SearchResult[] = [];
    searches.forEach((response, index) => {
      (response.data || []).forEach((row: any) => {
        found.push({
          id: String(row.id),
          title: row.scheme_name || row.project_name || row.title || row.document_name,
          subtitle: row.status || row.category || row.tender_no || '',
          page: ['schemes', 'development', 'tenders', 'home', 'downloads'][index]
        });
      });
    });
    setResults(found);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {t('Search the Website', 'संकेतस्थळ शोध', 'वेबसाइट खोजें')}
      </h1>
      <form onSubmit={runSearch} className="flex gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
          placeholder={t('Search schemes, works, tenders, news...', 'योजना, कामे, निविदा, बातम्या शोधा...', 'योजनाएं, कार्य, निविदाएं, समाचार खोजें...')}
        />
        <button type="submit" className="bg-green-700 text-white rounded-lg px-5 py-3 flex items-center gap-2">
          <Search size={20} />
          {t('Search', 'शोधा', 'खोजें')}
        </button>
      </form>
      {loading && <p className="mt-6 text-gray-600">{t('Searching...', 'शोधत आहे...', 'खोज रहा है...')}</p>}
      {!loading && query && results.length === 0 && (
        <p className="mt-6 text-gray-600">{t('No data available', 'माहिती उपलब्ध नाही', 'जानकारी उपलब्ध नहीं है')}</p>
      )}
      <div className="mt-6 space-y-3">
        {results.map((result) => (
          <a key={`${result.page}-${result.id}`} href={`/${result.page}`} className="block bg-white rounded-lg shadow p-4 hover:shadow-md">
            <p className="font-semibold text-gray-900">{result.title}</p>
            {result.subtitle && <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>}
          </a>
        ))}
      </div>
    </div>
  );
};

export default PublicSearch;
