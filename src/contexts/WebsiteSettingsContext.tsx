/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface WebsiteSettings {
  // Basic Info
  village_name: string;
  village_name_mr: string;
  village_name_hi: string;
  district: string;
  district_mr: string;
  district_hi: string;
  taluka: string;
  taluka_mr: string;
  taluka_hi: string;
  state: string;
  state_mr: string;
  state_hi: string;
  pincode: string;
  population: string;
  general_population: string;
  sc_population: string;
  st_population: string;
  male_population: string;
  female_population: string;
  voter_count: string;
  male_voters: string;
  female_voters: string;
  total_families: string;
  area_sqkm: string;
  
  // Location (for Maps)
  latitude: string;
  longitude: string;
  
  // Contact
  office_address: string;
  office_address_mr: string;
  office_address_hi: string;
  phone_number: string;
  email: string;
  office_hours: string;
  office_hours_mr: string;
  gram_panchayat_officer_name: string;
  gram_panchayat_officer_name_mr: string;
  officer_email: string;
  
  // Social Media
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  instagram_url: string;
  
  // Appearance
  hero_title: string;
  hero_title_mr: string;
  hero_subtitle: string;
  hero_subtitle_mr: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  
  // About Us
  about_history: string;
  about_history_mr: string;
  about_geography: string;
  about_geography_mr: string;
  about_culture: string;
  about_culture_mr: string;
  about_economy: string;
  about_economy_mr: string;
  sarpanch_name: string;
  sarpanch_name_mr: string;
  sarpanch_message: string;
  sarpanch_message_mr: string;
  sarpanch_photo_url: string;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: WebsiteSettings = {
  village_name: 'Shegaon',
  village_name_mr: 'शेगाव',
  village_name_hi: 'शेगांव',
  district: 'District',
  district_mr: 'जिल्हा',
  district_hi: 'जिला',
  taluka: 'Taluka',
  taluka_mr: 'तालुका',
  taluka_hi: 'तालुका',
  state: 'Maharashtra',
  state_mr: 'महाराष्ट्र',
  state_hi: 'महाराष्ट्र',
  pincode: '',
  population: '2241',
  general_population: '1541',
  sc_population: '301',
  st_population: '399',
  male_population: '',
  female_population: '',
  voter_count: '1603',
  male_voters: '866',
  female_voters: '737',
  total_families: '',
  area_sqkm: '',
  latitude: '',
  longitude: '',
  office_address: '',
  office_address_mr: '',
  office_address_hi: '',
  phone_number: '8999939667',
  email: 'grampanchayatshegaon908@gmail.com',
  office_hours: '',
  office_hours_mr: '',
  gram_panchayat_officer_name: 'Mrs. Jadhav S. K.',
  gram_panchayat_officer_name_mr: 'श्रीमती जाधव एस. के.',
  officer_email: 'saritarathod028@gmail.com',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  instagram_url: '',
  hero_title: 'Welcome to Digital Shegaon',
  hero_title_mr: 'डिजिटल शेगावमध्ये आपले स्वागत',
  hero_subtitle: 'Your Gateway to Village Services',
  hero_subtitle_mr: 'गाव सेवांचे प्रवेशद्वार',
  primary_color: '#16a34a',
  secondary_color: '#15803d',
  accent_color: '#14532d',
  about_history: '',
  about_history_mr: '',
  about_geography: '',
  about_geography_mr: '',
  about_culture: '',
  about_culture_mr: '',
  about_economy: '',
  about_economy_mr: '',
  sarpanch_name: '',
  sarpanch_name_mr: '',
  sarpanch_message: '',
  sarpanch_message_mr: '',
  sarpanch_photo_url: '',
};

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useWebsiteSettings = () => useContext(WebsiteSettingsContext);

export const WebsiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_website_settings')
        .select('*');

      if (error) {
        console.error('Error fetching website settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const newSettings = { ...defaultSettings };
        
        data.forEach((setting: { setting_type: string; setting_key: string; setting_value: string }) => {
          const key = setting.setting_key as keyof WebsiteSettings;
          if (key in newSettings && setting.setting_value) {
            (newSettings as any)[key] = setting.setting_value;
          }
        });
        
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <WebsiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
};
