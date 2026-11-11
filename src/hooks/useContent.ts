import { useState, useEffect } from 'react';
// Legacy database content APIs disabled; use safe placeholders for now
import type { Content, Category, ContentSection } from '../types';

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setContent([]);
      setCategories([]);
      setSections([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { content, categories, sections, loading, refetch: fetchData };
}