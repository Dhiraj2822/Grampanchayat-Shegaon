/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Image, Award, Building, Newspaper, Archive, Save, Plus, Edit, Trash, Video, X, Layout, Shield, Phone, Wallet, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentManagementProps {
  onNavigate: (page: string) => void;
  initialSection?: string | null;
}

// Field definitions for each table
const tableFields: Record<string, { name: string; type: string; required?: boolean; options?: string[] }[]> = {
  'cms_elected_officials': [
    { name: 'name', type: 'text', required: true },
    { name: 'position', type: 'text', required: true },
    { name: 'ward', type: 'number' },
    { name: 'photo_url', type: 'image_upload' },
    { name: 'term_start', type: 'date' },
    { name: 'term_end', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_staff': [
    { name: 'name', type: 'text', required: true },
    { name: 'designation', type: 'text' },
    { name: 'contact', type: 'text' },
    { name: 'photo_url', type: 'image_upload' },
    { name: 'joining_date', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_development_works': [
    { name: 'project_name', type: 'text', required: true },
    { name: 'work_type', type: 'select', required: true, options: ['Road Construction', 'Water Supply', 'Drainage', 'Building', 'Electrification', 'Other'] },
    { name: 'budget', type: 'number' },
    { name: 'status', type: 'select', required: true, options: ['Planned', 'In Progress', 'Completed', 'On Hold'] },
    { name: 'progress_percent', type: 'number' },
    { name: 'photo_url', type: 'file' },
  ],
  'cms_schemes': [
    { name: 'scheme_name', type: 'text', required: true },
    { name: 'scheme_type', type: 'select', required: true, options: ['Central Government', 'State Government', 'Local/Panchayat'] },
    { name: 'beneficiary_count', type: 'number' },
    { name: 'status', type: 'select', options: ['Active', 'Upcoming', 'Closed'] },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_flash_news': [
    { name: 'title', type: 'text', required: true },
    { name: 'priority', type: 'number' },
    { name: 'date', type: 'date' },
    { name: 'status', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_tenders': [
    { name: 'tender_no', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'value', type: 'number' },
    { name: 'status', type: 'text' },
    { name: 'pdf_url', type: 'file' },
  ],
  'cms_downloads': [
    { name: 'document_name', type: 'text', required: true },
    { name: 'category', type: 'text' },
    { name: 'file_url', type: 'file', required: true },
    { name: 'status', type: 'select', options: ['active', 'archived', 'pending'] },
  ],
  'cms_video_gallery': [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'video_source', type: 'select', required: true, options: ['YouTube', 'Upload'] },
    { name: 'video_url', type: 'video_upload' },
    { name: 'thumbnail_url', type: 'image_upload' },
    { name: 'publish_date', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_gallery': [
    { name: 'title', type: 'text', required: true },
    { name: 'image_source', type: 'select', required: true, options: ['Upload', 'URL'] },
    { name: 'image_url', type: 'image_upload', required: true },
    { name: 'category', type: 'text' },
    { name: 'event_date', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_carousel': [
    { name: 'slide_order', type: 'number', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'subtitle_mr', type: 'text' },
    { name: 'image_url', type: 'image_upload', required: true },
    { name: 'button_text', type: 'text' },
    { name: 'button_text_mr', type: 'text' },
    { name: 'button_link', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_contact_info': [
    { name: 'label', type: 'text', required: true },
    { name: 'label_mr', type: 'text' },
    { name: 'contact_type', type: 'select', options: ['office', 'emergency', 'helpline', 'department'] },
    { name: 'contact_person', type: 'text' },
    { name: 'contact_person_mr', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'address_mr', type: 'textarea' },
    { name: 'timings', type: 'text' },
    { name: 'timings_mr', type: 'text' },
    { name: 'order_index', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_village_info': [
    { name: 'info_type', type: 'select', required: true, options: ['history', 'geography', 'culture', 'economy', 'facilities', 'other'] },
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'content', type: 'textarea' },
    { name: 'content_mr', type: 'textarea' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_committees': [
    { name: 'name', type: 'text', required: true },
    { name: 'name_mr', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'description_mr', type: 'textarea' },
    { name: 'committee_type', type: 'select', options: ['Standing', 'Special', 'Subject', 'Other'] },
    { name: 'formation_date', type: 'date' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_budget_items': [
    { name: 'financial_year', type: 'text', required: true },
    { name: 'category', type: 'select', options: ['Income', 'Expenditure', 'Development', 'Administrative', 'Other'] },
    { name: 'head_name', type: 'text', required: true },
    { name: 'head_name_mr', type: 'text' },
    { name: 'budgeted_amount', type: 'number' },
    { name: 'spent_amount', type: 'number' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_infrastructure_records': [
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'category', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'ward', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_education_records': [
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'document_url', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_employment_records': [
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'application_url', type: 'text' },
    { name: 'deadline', type: 'date' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_environment_records': [
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'metric_value', type: 'number' },
    { name: 'metric_unit', type: 'text' },
    { name: 'record_date', type: 'date' },
    { name: 'image_url', type: 'image_upload' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_official_hierarchy': [
    { name: 'name', type: 'text', required: true },
    { name: 'name_mr', type: 'text' },
    { name: 'name_hi', type: 'text' },
    { name: 'designation', type: 'text', required: true },
    { name: 'designation_mr', type: 'text' },
    { name: 'designation_hi', type: 'text' },
    { name: 'department', type: 'text' },
    { name: 'photo_url', type: 'image_upload' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_ward_statistics': [
    { name: 'ward_number', type: 'text', required: true },
    { name: 'population', type: 'number' },
    { name: 'households', type: 'number' },
    { name: 'literacy_percent', type: 'number' },
    { name: 'water_coverage_percent', type: 'number' },
    { name: 'electricity_coverage_percent', type: 'number' },
    { name: 'sanitation_percent', type: 'number' },
    { name: 'record_year', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_events': [
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'event_type', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'start_at', type: 'datetime' },
    { name: 'end_at', type: 'datetime' },
    { name: 'document_url', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_emergency_contacts': [
    { name: 'name', type: 'text', required: true },
    { name: 'name_mr', type: 'text' },
    { name: 'name_hi', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'phone', type: 'text', required: true },
    { name: 'alternate_phone', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'hours', type: 'text' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_impact_metrics': [
    { name: 'metric_key', type: 'text', required: true },
    { name: 'metric_label', type: 'text', required: true },
    { name: 'metric_label_mr', type: 'text' },
    { name: 'metric_label_hi', type: 'text' },
    { name: 'metric_value', type: 'number' },
    { name: 'metric_unit', type: 'text' },
    { name: 'record_year', type: 'text' },
    { name: 'display_order', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_sankalp_pledges': [
    { name: 'pledge_number', type: 'number', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'title_mr', type: 'text' },
    { name: 'title_hi', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'target_value', type: 'number' },
    { name: 'achieved_value', type: 'number' },
    { name: 'metric_unit', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_partnerships': [
    { name: 'name', type: 'text', required: true },
    { name: 'partner_type', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'contact_name', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website_url', type: 'text' },
    { name: 'is_active', type: 'boolean' },
  ],
  'cms_beneficiary_stories': [
    { name: 'title', type: 'text', required: true },
    { name: 'beneficiary_name', type: 'text' },
    { name: 'story', type: 'textarea' },
    { name: 'story_mr', type: 'textarea' },
    { name: 'story_hi', type: 'textarea' },
    { name: 'scheme_name', type: 'text' },
    { name: 'image_url', type: 'image_upload' },
    { name: 'is_active', type: 'boolean' },
  ],
};

const ContentManagement: React.FC<ContentManagementProps> = ({ onNavigate, initialSection }) => {
  const { profile, loading, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = profile?.role === 'super_admin';
  
  // Sections restricted to super_admin only
  const superAdminOnlySections = ['website-settings', 'village-info', 'contact-info'];
  
  // Form states for different sections
  const [websiteSettings, setWebsiteSettings] = useState<any>({});
  const [villageInfo, setVillageInfo] = useState<any[]>([]);
  const [electedOfficials, setElectedOfficials] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [developmentWorks, setDevelopmentWorks] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [newsAnnouncements, setNewsAnnouncements] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [videoGallery, setVideoGallery] = useState<any[]>([]);
  const [infrastructureRecords, setInfrastructureRecords] = useState<any[]>([]);
  const [educationRecords, setEducationRecords] = useState<any[]>([]);
  const [employmentRecords, setEmploymentRecords] = useState<any[]>([]);
  const [environmentRecords, setEnvironmentRecords] = useState<any[]>([]);
  const [officialHierarchy, setOfficialHierarchy] = useState<any[]>([]);
  const [wardStatistics, setWardStatistics] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<any[]>([]);
  const [sankalpPledges, setSankalpPledges] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [beneficiaryStories, setBeneficiaryStories] = useState<any[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentTable, setCurrentTable] = useState('');

  // Set default active section based on role and initialSection
  useEffect(() => {
    if (profile && !activeSection) {
      if (initialSection) {
        // Check if section is allowed for the user
        if (superAdminOnlySections.includes(initialSection) && !isSuperAdmin) {
          setActiveSection('carousel'); // Fallback for non-super admin
        } else {
          setActiveSection(initialSection);
        }
      } else {
        setActiveSection(isSuperAdmin ? 'website-settings' : 'carousel');
      }
    }
  }, [profile, isSuperAdmin, initialSection]);

  useEffect(() => {
    if (activeSection) {
      loadContent();
    }
  }, [activeSection]);

  // Auto-refresh profile if not loaded
  useEffect(() => {
    if (!profile && !loading) {
      console.log('Profile not loaded, refreshing...');
      refreshProfile();
    }
  }, [profile, loading, refreshProfile]);

  const loadContent = async () => {
    setContentLoading(true);
    try {
      switch (activeSection) {
        case 'website-settings':
          await loadWebsiteSettings();
          break;
        case 'village-info':
          await loadVillageInfo();
          break;
        case 'elected-officials':
          await loadElectedOfficials();
          break;
        case 'staff-members':
          await loadStaffMembers();
          break;
        case 'development-works':
          await loadDevelopmentWorks();
          break;
        case 'schemes':
          await loadSchemes();
          break;
        case 'news-announcements':
          await loadNewsAnnouncements();
          break;
        case 'gallery':
          await loadGalleryItems();
          break;
        case 'committees':
          await loadCommittees();
          break;
        case 'tenders':
          await loadTenders();
          break;
        case 'budget':
          await loadBudgetItems();
          break;
        case 'forms':
          await loadForms();
          break;
        case 'video-gallery':
          await loadVideoGallery();
          break;
        case 'carousel':
          await loadCarouselSlides();
          break;
        case 'contact-info':
          await loadContactInfo();
          break;
        case 'infrastructure':
          await loadGovernanceTable('cms_infrastructure_records', setInfrastructureRecords);
          break;
        case 'education':
          await loadGovernanceTable('cms_education_records', setEducationRecords);
          break;
        case 'employment':
          await loadGovernanceTable('cms_employment_records', setEmploymentRecords);
          break;
        case 'environment':
          await loadGovernanceTable('cms_environment_records', setEnvironmentRecords);
          break;
        case 'hierarchy':
          await loadGovernanceTable('cms_official_hierarchy', setOfficialHierarchy);
          break;
        case 'wards':
          await loadGovernanceTable('cms_ward_statistics', setWardStatistics);
          break;
        case 'events':
          await loadGovernanceTable('cms_events', setEvents);
          break;
        case 'emergency':
          await loadGovernanceTable('cms_emergency_contacts', setEmergencyContacts);
          break;
        case 'impact':
          await loadGovernanceTable('cms_impact_metrics', setImpactMetrics);
          break;
        case 'pledges':
          await loadGovernanceTable('cms_sankalp_pledges', setSankalpPledges);
          break;
        case 'partnerships':
          await loadGovernanceTable('cms_partnerships', setPartnerships);
          break;
        case 'stories':
          await loadGovernanceTable('cms_beneficiary_stories', setBeneficiaryStories);
          break;
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const loadGovernanceTable = async (
    tableName: string,
    setRows: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (!error && data) setRows(data);
  };

  const loadWebsiteSettings = async () => {
    const { data, error } = await supabase
      .from('cms_website_settings')
      .select('*')
      .order('setting_type, setting_key');
    
    if (!error && data) {
      const settingsObj: any = {};
      data.forEach((setting: any) => {
        if (!settingsObj[setting.setting_type]) {
          settingsObj[setting.setting_type] = {};
        }
        settingsObj[setting.setting_type][setting.setting_key] = setting.setting_value;
      });
      setWebsiteSettings(settingsObj);
    }
  };

  const loadVillageInfo = async () => {
    const { data, error } = await supabase
      .from('cms_village_info')
      .select('*')
      .order('display_order');
    
    if (!error && data) {
      setVillageInfo(data);
    }
  };

  const loadElectedOfficials = async () => {
    const { data, error } = await supabase
      .from('cms_elected_officials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setElectedOfficials(data);
    }
  };

  const loadStaffMembers = async () => {
    const { data, error } = await supabase
      .from('cms_staff')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setStaffMembers(data);
    }
  };

  const loadDevelopmentWorks = async () => {
    const { data, error } = await supabase
      .from('cms_development_works')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDevelopmentWorks(data);
    }
  };

  const loadSchemes = async () => {
    const { data, error } = await supabase
      .from('cms_schemes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSchemes(data);
    }
  };

  const loadNewsAnnouncements = async () => {
    const { data, error } = await supabase
      .from('cms_flash_news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setNewsAnnouncements(data);
    }
  };

  const loadGalleryItems = async () => {
    const { data, error } = await supabase
      .from('cms_gallery')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setGalleryItems(data);
    }
  };

  const loadCommittees = async () => {
    const { data, error } = await supabase
      .from('cms_committees')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (!error && data) {
      setCommittees(data);
    }
  };

  const loadTenders = async () => {
    const { data, error } = await supabase
      .from('cms_tenders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTenders(data);
    }
  };

  const loadBudgetItems = async () => {
    const { data, error } = await supabase
      .from('cms_budget_items')
      .select('*')
      .order('financial_year', { ascending: false });
    
    if (!error && data) {
      setBudgetItems(data);
    }
  };

  const loadForms = async () => {
    const { data, error } = await supabase
      .from('cms_downloads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setForms(data);
    }
  };

  const loadVideoGallery = async () => {
    const { data, error } = await supabase
      .from('cms_video_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setVideoGallery(data);
    }
  };

  const loadCarouselSlides = async () => {
    const { data, error } = await supabase
      .from('cms_carousel')
      .select('*')
      .order('slide_order', { ascending: true });
    
    if (!error && data) {
      setCarouselSlides(data);
    }
  };

  const loadContactInfo = async () => {
    const { data, error } = await supabase
      .from('cms_contact_info')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!error && data) {
      setContactInfo(data);
    }
  };

  const saveWebsiteSettings = async () => {
    setSaving(true);
    try {
      for (const [settingType, settings] of Object.entries(websiteSettings)) {
        for (const [key, value] of Object.entries(settings as any)) {
          // Use upsert to insert or update
          const { error } = await supabase
            .from('cms_website_settings')
            .upsert({ 
              setting_type: settingType,
              setting_key: key,
              setting_value: value as string,
              updated_by: profile?.id,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'setting_type,setting_key'
            });
          if (error) {
            console.error('Error saving setting', { settingType, key, error });
            throw error;
          }
        }
      }
      alert('Website settings saved successfully!');
    } catch (error) {
      console.error('Save settings failed:', error);
      alert(`Error saving settings: ${(error as any)?.message || 'any error'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (table: string, id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (!error) {
        loadContent();
        alert('Item deleted successfully!');
      } else {
        console.error('Delete failed:', { table, id, error });
        alert(`Error deleting item: ${error.message}`);
      }
    }
  };

  const addItem = async (table: string) => {
    try {
      // Add default is_active if the table has it
      const dataToInsert = { ...formData };
      if (tableFields[table]?.some(f => f.name === 'is_active') && dataToInsert.is_active === undefined) {
        dataToInsert.is_active = true;
      }
      
      const { error } = await supabase
        .from(table)
        .insert(dataToInsert);
      
      if (!error) {
        loadContent();
        setShowAddForm(false);
        setFormData({});
        alert('Item added successfully!');
      } else {
        console.error('Add failed:', { table, error });
        alert(`Error adding item: ${error.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const updateItem = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update(formData)
        .eq('id', id);
      
      if (!error) {
        loadContent();
        setEditingItem(null);
        setFormData({});
        alert('Item updated successfully!');
      } else {
        console.error('Update failed:', { table, id, error });
        alert(`Error updating item: ${error.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const openAddForm = (table: string) => {
    setCurrentTable(table);
    setFormData({});
    setShowAddForm(true);
    setEditingItem(null);
  };

  const openEditForm = (table: string, item: any) => {
    setCurrentTable(table);
    setFormData({ ...item });
    setEditingItem(item);
    setShowAddForm(false);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({});
    setCurrentTable('');
  };

  const handleFileUpload = async (fieldName: string, file: File, folder: string = 'uploads') => {
    setUploading(true);
    try {
      if (fieldName === 'video_url') {
        const videoExtensions = /\.(mp4|webm|ogg|mov|m4v)$/i;
        const isVideo = file.type.startsWith('video/') || videoExtensions.test(file.name);
        if (!isVideo) {
          throw new Error('Please select a video file (MP4, WebM, OGG, MOV, or M4V).');
        }
      }

      // Map field names to appropriate folders
      const folderMap: { [key: string]: string } = {
        'pdf_url': 'tenders',
        'file_url': 'downloads',
        'image_url': 'gallery',
        'video_url': 'videos',
        'thumbnail_url': 'thumbnails'
      };
      
      const uploadFolder = folderMap[fieldName] || folder;
      const fileExt = file.name.split('.').pop();
      const fileName = `${uploadFolder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Validate file size based on type
      let maxSize = 5 * 1024 * 1024; // 5MB default for images
      let typeLabel = 'File';

      if (fieldName === 'video_url') {
        maxSize = 50 * 1024 * 1024; // 50MB for videos
        typeLabel = 'Video';
      } else if (fieldName === 'pdf_url' || fieldName === 'file_url') {
        maxSize = 20 * 1024 * 1024; // 20MB for documents
        typeLabel = 'Document';
      }

      if (file.size > maxSize) {
        throw new Error(`${typeLabel} size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds ${(maxSize / (1024 * 1024))}MB limit`);
      }
      
      // Use 'uploads' bucket - make sure to run 2025-12-14_storage.sql in Supabase
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { upsert: true });
      
      if (error) {
        console.error('Upload error details:', error);
        if (error.message?.includes('bucket') || error.message?.includes('not found')) {
          throw new Error('Storage bucket not found. Please run the storage SQL migration in Supabase.');
        }
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      setFormData({ ...formData, [fieldName]: publicUrl });
      return publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const renderFormField = (field: { name: string; type: string; required?: boolean; options?: string[] }) => {
    const value = formData[field.name] ?? '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({
              ...formData,
              [field.name]: e.target.value,
              ...(field.name === 'video_source' ? { video_url: '' } : {})
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            required={field.required}
          />
        );
      case 'boolean':
        return (
          <select
            value={value === true ? 'true' : value === false ? 'false' : ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value === 'true' })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        );
      case 'select':
        // Use provided options if available
        if (field.options && field.options.length > 0) {
          return (
            <select
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required={field.required}
            >
              <option value="">Select {field.name.replace(/_/g, ' ')}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? Number(e.target.value) : null })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={field.required}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value ? value.split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value || null })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={field.required}
          />
        );
      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://..."
            required={field.required}
          />
        );
      case 'file':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Upload file or enter URL</p>
            </div>
            
            {value && (
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate flex-1">
                  {value.split('/').pop() || 'View file'}
                </a>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, [field.name]: '' })}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-2"
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Choose file to upload:</label>
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleFileUpload(field.name, file, 'uploads');
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 20MB. PDF, DOC, DOCX.</p>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Or paste URL directly:</label>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            {uploading && <p className="text-sm text-gray-500">Uploading file...</p>}
          </div>
        );
      case 'image_upload':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Upload image or enter URL</p>
            </div>
            
            {value && (
              <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-md">
                <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded border border-gray-300" />
                <div className="flex-1">
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                    {value.split('/').pop() || 'View image'}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, [field.name]: '' })}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-2"
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Choose image to upload:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleFileUpload(field.name, file, 'images');
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. JPG, PNG, GIF.</p>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Or paste image URL directly:</label>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            {uploading && <p className="text-sm text-gray-500">Uploading image...</p>}
          </div>
        );
      case 'video_upload': {
        const videoSource = formData['video_source'];
        return (
          <div className="space-y-3">
            {videoSource === 'YouTube' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required={field.required}
                />
              </div>
            ) : videoSource === 'Upload' ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm font-medium text-blue-900">Upload video file</p>
                </div>
                
                {value && (
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex-1 truncate">
                      {value.split('/').pop() || 'View video'}
                    </a>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, [field.name]: '' })}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleFileUpload(field.name, file, 'videos');
                    }
                    e.currentTarget.value = '';
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 50MB. MP4, WebM.</p>
                {uploading && <p className="text-sm text-gray-500">Uploading video...</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Please select video source first</p>
            )}
          </div>
        );
      }
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required={field.required}
          />
        );
    }
  };

  const renderAddEditModal = () => {
    if (!showAddForm && !editingItem) return null;
    
    const fields = tableFields[currentTable] || [];
    const isEditing = !!editingItem;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) {
              updateItem(currentTable, editingItem.id);
            } else {
              addItem(currentTable);
            }
          }} className="p-4 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFormField(field)}
              </div>
            ))}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderWebsiteSettings = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Website Settings</h3>
        <button
          onClick={saveWebsiteSettings}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village Name (English)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.village_name || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, village_name: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village Name (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.village_name_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, village_name_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village Name (हिन्दी)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.village_name_hi || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, village_name_hi: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District (English)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.district || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, district: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.district_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, district_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taluka (English)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.taluka || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, taluka: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taluka (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.taluka_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, taluka_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.state || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, state: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              value={websiteSettings.BASIC_INFO?.pincode || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, pincode: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Population</label>
            <input
              type="number"
              value={websiteSettings.BASIC_INFO?.population || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, population: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Male Population</label>
            <input
              type="number"
              value={websiteSettings.BASIC_INFO?.male_population || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, male_population: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Female Population</label>
            <input
              type="number"
              value={websiteSettings.BASIC_INFO?.female_population || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, female_population: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Families</label>
            <input
              type="number"
              value={websiteSettings.BASIC_INFO?.total_families || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, total_families: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq km)</label>
            <input
              type="number"
              step="0.01"
              value={websiteSettings.BASIC_INFO?.area_sqkm || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                BASIC_INFO: { ...websiteSettings.BASIC_INFO, area_sqkm: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Location (Google Maps) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">📍 Village Location (Google Maps)</h4>
        <p className="text-sm text-gray-500 mb-4">Enter coordinates to show village location on Google Maps. You can find coordinates from Google Maps by right-clicking on your village location.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              placeholder="e.g., 18.5204"
              value={websiteSettings.LOCATION?.latitude || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                LOCATION: { ...websiteSettings.LOCATION, latitude: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              placeholder="e.g., 73.8567"
              value={websiteSettings.LOCATION?.longitude || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                LOCATION: { ...websiteSettings.LOCATION, longitude: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        {websiteSettings.LOCATION?.latitude && websiteSettings.LOCATION?.longitude && (
          <div className="mt-4">
            <p className="text-sm text-green-600 mb-2">✓ Preview: Map will show at these coordinates</p>
            <a 
              href={`https://www.google.com/maps?q=${websiteSettings.LOCATION.latitude},${websiteSettings.LOCATION.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Open in Google Maps →
            </a>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Address (English)</label>
            <textarea
              value={websiteSettings.CONTACT?.office_address || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, office_address: e.target.value }
              })}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Address (मराठी)</label>
            <textarea
              value={websiteSettings.CONTACT?.office_address_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, office_address_mr: e.target.value }
              })}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Address (हिन्दी)</label>
            <textarea
              value={websiteSettings.CONTACT?.office_address_hi || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, office_address_hi: e.target.value }
              })}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={websiteSettings.CONTACT?.phone_number || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, phone_number: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={websiteSettings.CONTACT?.email || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, email: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gram Panchayat Officer (English)</label>
            <input
              type="text"
              value={websiteSettings.CONTACT?.gram_panchayat_officer_name || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, gram_panchayat_officer_name: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gram Panchayat Officer (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.CONTACT?.gram_panchayat_officer_name_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, gram_panchayat_officer_name_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Officer Email</label>
            <input
              type="email"
              value={websiteSettings.CONTACT?.officer_email || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, officer_email: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Hours (English)</label>
            <input
              type="text"
              value={websiteSettings.CONTACT?.office_hours || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, office_hours: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Hours (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.CONTACT?.office_hours_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                CONTACT: { ...websiteSettings.CONTACT, office_hours_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Social Media Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input
              type="url"
              value={websiteSettings.SOCIAL_MEDIA?.facebook_url || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                SOCIAL_MEDIA: { ...websiteSettings.SOCIAL_MEDIA, facebook_url: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
            <input
              type="url"
              value={websiteSettings.SOCIAL_MEDIA?.twitter_url || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                SOCIAL_MEDIA: { ...websiteSettings.SOCIAL_MEDIA, twitter_url: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input
              type="url"
              value={websiteSettings.SOCIAL_MEDIA?.youtube_url || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                SOCIAL_MEDIA: { ...websiteSettings.SOCIAL_MEDIA, youtube_url: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input
              type="url"
              value={websiteSettings.SOCIAL_MEDIA?.instagram_url || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                SOCIAL_MEDIA: { ...websiteSettings.SOCIAL_MEDIA, instagram_url: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">Website Appearance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (English)</label>
            <input
              type="text"
              value={websiteSettings.APPEARANCE?.hero_title || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, hero_title: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.APPEARANCE?.hero_title_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, hero_title_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle (English)</label>
            <input
              type="text"
              value={websiteSettings.APPEARANCE?.hero_subtitle || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, hero_subtitle: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle (मराठी)</label>
            <input
              type="text"
              value={websiteSettings.APPEARANCE?.hero_subtitle_mr || ''}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, hero_subtitle_mr: e.target.value }
              })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Gradient Start)</label>
            <input
              type="color"
              value={websiteSettings.APPEARANCE?.primary_color || '#16a34a'}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, primary_color: e.target.value }
              })}
              className="w-full h-10 border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color (Gradient Middle)</label>
            <input
              type="color"
              value={websiteSettings.APPEARANCE?.secondary_color || '#15803d'}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, secondary_color: e.target.value }
              })}
              className="w-full h-10 border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color (Gradient End)</label>
            <input
              type="color"
              value={websiteSettings.APPEARANCE?.accent_color || '#14532d'}
              onChange={(e) => setWebsiteSettings({
                ...websiteSettings,
                APPEARANCE: { ...websiteSettings.APPEARANCE, accent_color: e.target.value }
              })}
              className="w-full h-10 border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* About Us Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">📖 About Us Page Content</h4>
        <p className="text-sm text-gray-500 mb-4">This content will be shown on the "About Us" page of the website.</p>
        
        {/* History */}
        <div className="border-b pb-4 mb-4">
          <h5 className="font-medium text-gray-800 mb-3">Village History</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">History (English)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_history || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_history: e.target.value }
                })}
                rows={4}
                placeholder="Write about the village history..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">History (मराठी)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_history_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_history_mr: e.target.value }
                })}
                rows={4}
                placeholder="गावाचा इतिहास लिहा..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Geography */}
        <div className="border-b pb-4 mb-4">
          <h5 className="font-medium text-gray-800 mb-3">Geography & Climate</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geography (English)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_geography || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_geography: e.target.value }
                })}
                rows={4}
                placeholder="Describe the village geography and climate..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geography (मराठी)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_geography_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_geography_mr: e.target.value }
                })}
                rows={4}
                placeholder="भूगोल आणि हवामान वर्णन करा..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Culture */}
        <div className="border-b pb-4 mb-4">
          <h5 className="font-medium text-gray-800 mb-3">Culture & Traditions</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Culture (English)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_culture || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_culture: e.target.value }
                })}
                rows={4}
                placeholder="Describe the village culture and traditions..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Culture (मराठी)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_culture_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_culture_mr: e.target.value }
                })}
                rows={4}
                placeholder="संस्कृती आणि परंपरा वर्णन करा..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Economy */}
        <div className="border-b pb-4 mb-4">
          <h5 className="font-medium text-gray-800 mb-3">Economy & Livelihood</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Economy (English)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_economy || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_economy: e.target.value }
                })}
                rows={4}
                placeholder="Describe the main occupations and economy..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Economy (मराठी)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.about_economy_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, about_economy_mr: e.target.value }
                })}
                rows={4}
                placeholder="मुख्य व्यवसाय आणि अर्थव्यवस्था वर्णन करा..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sarpanch Message */}
        <div>
          <h5 className="font-medium text-gray-800 mb-3">Sarpanch Message</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarpanch Name (English)</label>
              <input
                type="text"
                value={websiteSettings.ABOUT_US?.sarpanch_name || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, sarpanch_name: e.target.value }
                })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarpanch Name (मराठी)</label>
              <input
                type="text"
                value={websiteSettings.ABOUT_US?.sarpanch_name_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, sarpanch_name_mr: e.target.value }
                })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarpanch Photo URL</label>
              <input
                type="url"
                value={websiteSettings.ABOUT_US?.sarpanch_photo_url || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, sarpanch_photo_url: e.target.value }
                })}
                placeholder="https://..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarpanch Message (English)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.sarpanch_message || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, sarpanch_message: e.target.value }
                })}
                rows={4}
                placeholder="Sarpanch's welcome message..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sarpanch Message (मराठी)</label>
              <textarea
                value={websiteSettings.ABOUT_US?.sarpanch_message_mr || ''}
                onChange={(e) => setWebsiteSettings({
                  ...websiteSettings,
                  ABOUT_US: { ...websiteSettings.ABOUT_US, sarpanch_message_mr: e.target.value }
                })}
                rows={4}
                placeholder="सरपंचांचा स्वागत संदेश..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTable = (data: any[], columns: string[], table: string) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {table.replace(/cms_/g, '').replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h3>
        <button
          onClick={() => openAddForm(table)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </button>
      </div>
      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No items found. Click "Add New" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.includes('url') && item[column] ? (
                        <a href={item[column]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">📎 View</a>
                      ) : column.includes('date') ? (
                        item[column] ? new Date(item[column]).toLocaleDateString() : '-'
                      ) : column === 'is_active' ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${item[column] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item[column] ? 'Active' : 'Inactive'}
                        </span>
                      ) : (
                        String(item[column] ?? '-').length > 50 ? 
                          String(item[column] ?? '-').substring(0, 50) + '...' : 
                          String(item[column] ?? '-')
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditForm(table, item)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(table, item.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Allow both admin and super_admin to access ContentManagement
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only Admins can access content management.</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add/Edit Modal */}
      {renderAddEditModal()}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Content Management System</h1>
              <p className="text-blue-100">Manage all website content from one place</p>
            </div>
            <button
              onClick={() => {
                // Navigate based on user role
                if (profile?.role === 'super_admin') {
                  onNavigate('super-admin-dashboard');
                } else if (profile?.role === 'admin') {
                  onNavigate('admin-dashboard');
                } else {
                  onNavigate('home');
                }
              }}
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              {/* Super Admin Only Section */}
              {isSuperAdmin && (
                <>
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Super Admin Only
                    </h4>
                    <nav className="space-y-1">
                      {[
                        { id: 'website-settings', name: 'Website & Branding', icon: Settings },
                        { id: 'village-info', name: 'Village Info / About', icon: MapPin },
                        { id: 'contact-info', name: 'Contact & Location', icon: Phone },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-md ${
                              activeSection === item.id
                                ? 'bg-red-100 text-red-700'
                                : 'text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                  <hr className="my-3" />
                </>
              )}
              
              {/* Admin Content Section */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Content Management
                </h4>
                <nav className="space-y-1">
                  {[
                    { id: 'carousel', name: 'Hero Carousel', icon: Layout },
                    { id: 'elected-officials', name: 'Elected Officials', icon: Users },
                    { id: 'staff-members', name: 'Staff', icon: Building },
                    { id: 'development-works', name: 'Development Works', icon: Building },
                    { id: 'schemes', name: 'Government Schemes', icon: Award },
                    { id: 'news-announcements', name: 'Flash News', icon: Newspaper },
                    { id: 'gallery', name: 'Photo Gallery', icon: Image },
                    { id: 'video-gallery', name: 'Video Gallery', icon: Video },
                    { id: 'tenders', name: 'Tenders', icon: FileText },
                    { id: 'forms', name: 'Downloads', icon: Archive },
                    { id: 'committees', name: 'Committees', icon: Users },
                    { id: 'budget', name: 'Budget', icon: Wallet },
                    { id: 'infrastructure', name: 'Infrastructure & Facilities', icon: Building },
                    { id: 'education', name: 'Education & Youth', icon: Users },
                    { id: 'employment', name: 'Employment & Skills', icon: Award },
                    { id: 'environment', name: 'Environment & Sustainability', icon: Building },
                    { id: 'hierarchy', name: 'Government Hierarchy', icon: Users },
                    { id: 'wards', name: 'Ward Statistics', icon: MapPin },
                    { id: 'events', name: 'Events & Calendar', icon: Calendar },
                    { id: 'emergency', name: 'Emergency Contacts', icon: Phone },
                    { id: 'impact', name: 'Impact Dashboard', icon: Award },
                    { id: 'pledges', name: 'Sankalp Tracker', icon: Award },
                    { id: 'partnerships', name: 'Partners & Volunteers', icon: Users },
                    { id: 'stories', name: 'Beneficiary Stories', icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-md ${
                          activeSection === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            {contentLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div>
                {activeSection === 'website-settings' && isSuperAdmin && renderWebsiteSettings()}
                {activeSection === 'village-info' && isSuperAdmin && renderDataTable(villageInfo, ['info_type', 'title', 'title_mr', 'content', 'display_order', 'is_active'], 'cms_village_info')}
                {activeSection === 'contact-info' && isSuperAdmin && renderDataTable(contactInfo, ['label', 'contact_type', 'contact_person', 'phone', 'email', 'is_active'], 'cms_contact_info')}
                {activeSection === 'carousel' && renderDataTable(carouselSlides, ['slide_order', 'title', 'button_text', 'button_link', 'is_active'], 'cms_carousel')}
                {activeSection === 'elected-officials' && renderDataTable(electedOfficials, ['name', 'position', 'ward', 'term_start', 'term_end', 'is_active'], 'cms_elected_officials')}
                {activeSection === 'staff-members' && renderDataTable(staffMembers, ['name', 'designation', 'contact', 'joining_date', 'is_active'], 'cms_staff')}
                {activeSection === 'development-works' && renderDataTable(developmentWorks, ['project_name', 'work_type', 'budget', 'status', 'progress_percent'], 'cms_development_works')}
                {activeSection === 'schemes' && renderDataTable(schemes, ['scheme_name', 'scheme_type', 'beneficiary_count', 'status', 'is_active'], 'cms_schemes')}
                {activeSection === 'news-announcements' && renderDataTable(newsAnnouncements, ['title', 'priority', 'date', 'status', 'is_active'], 'cms_flash_news')}
                {activeSection === 'gallery' && renderDataTable(galleryItems, ['title', 'image_source', 'category', 'event_date', 'is_active'], 'cms_gallery')}
                {activeSection === 'video-gallery' && renderDataTable(videoGallery, ['title', 'video_source', 'publish_date', 'is_active'], 'cms_video_gallery')}
                {activeSection === 'tenders' && renderDataTable(tenders, ['tender_no', 'title', 'value', 'status'], 'cms_tenders')}
                {activeSection === 'forms' && renderDataTable(forms, ['document_name', 'category', 'file_url'], 'cms_downloads')}
                {activeSection === 'committees' && renderDataTable(committees, ['name', 'committee_type', 'formation_date', 'is_active'], 'cms_committees')}
                {activeSection === 'budget' && renderDataTable(budgetItems, ['financial_year', 'category', 'head_name', 'budgeted_amount', 'spent_amount', 'is_active'], 'cms_budget_items')}
                {activeSection === 'infrastructure' && renderDataTable(infrastructureRecords, ['title', 'title_mr', 'title_hi', 'category', 'ward', 'status', 'is_active'], 'cms_infrastructure_records')}
                {activeSection === 'education' && renderDataTable(educationRecords, ['title', 'title_mr', 'title_hi', 'category', 'document_url', 'is_active'], 'cms_education_records')}
                {activeSection === 'employment' && renderDataTable(employmentRecords, ['title', 'title_mr', 'title_hi', 'category', 'organization', 'deadline', 'is_active'], 'cms_employment_records')}
                {activeSection === 'environment' && renderDataTable(environmentRecords, ['title', 'title_mr', 'title_hi', 'category', 'metric_value', 'metric_unit', 'record_date', 'is_active'], 'cms_environment_records')}
                {activeSection === 'hierarchy' && renderDataTable(officialHierarchy, ['name', 'name_mr', 'name_hi', 'designation', 'department', 'display_order', 'is_active'], 'cms_official_hierarchy')}
                {activeSection === 'wards' && renderDataTable(wardStatistics, ['ward_number', 'population', 'households', 'literacy_percent', 'water_coverage_percent', 'electricity_coverage_percent', 'sanitation_percent', 'record_year', 'is_active'], 'cms_ward_statistics')}
                {activeSection === 'events' && renderDataTable(events, ['title', 'title_mr', 'title_hi', 'event_type', 'location', 'start_at', 'end_at', 'is_active'], 'cms_events')}
                {activeSection === 'emergency' && renderDataTable(emergencyContacts, ['name', 'name_mr', 'name_hi', 'organization', 'phone', 'alternate_phone', 'display_order', 'is_active'], 'cms_emergency_contacts')}
                {activeSection === 'impact' && renderDataTable(impactMetrics, ['metric_key', 'metric_label', 'metric_label_mr', 'metric_label_hi', 'metric_value', 'metric_unit', 'record_year', 'display_order', 'is_active'], 'cms_impact_metrics')}
                {activeSection === 'pledges' && renderDataTable(sankalpPledges, ['pledge_number', 'title', 'title_mr', 'title_hi', 'target_value', 'achieved_value', 'metric_unit', 'is_active'], 'cms_sankalp_pledges')}
                {activeSection === 'partnerships' && renderDataTable(partnerships, ['name', 'partner_type', 'contact_name', 'phone', 'email', 'website_url', 'is_active'], 'cms_partnerships')}
                {activeSection === 'stories' && renderDataTable(beneficiaryStories, ['title', 'beneficiary_name', 'scheme_name', 'story', 'image_url', 'is_active'], 'cms_beneficiary_stories')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;