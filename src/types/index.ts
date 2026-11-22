/* eslint-disable @typescript-eslint/no-explicit-any */
// =====================================================
// DIGITAL GRAM PANCHAYAT PORTAL TYPES
// =====================================================

// ===== ADMINISTRATION MODULE =====
export interface ElectedBody {
  id: string;
  name: string;
  name_mr?: string;
  designation: string;
  ward_number?: number;
  ward_name?: string;
  photo_url?: string;
  mobile?: string;
  email?: string;
  address?: string;
  education?: string;
  term_start_date?: string;
  term_end_date?: string;
  order_index?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GPStaff {
  id: string;
  name: string;
  name_mr?: string;
  designation: string;
  department?: string;
  photo_url?: string;
  mobile?: string;
  email?: string;
  office_hours?: string;
  responsibilities?: string;
  joining_date?: string;
  order_index?: number;
  is_active: boolean;
  created_at?: string;
}

export interface Committee {
  id: string;
  name: string;
  name_mr?: string;
  description?: string;
  description_mr?: string;
  type?: string;
  committee_type?: string;
  formation_date?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CommitteeMember {
  id: string;
  committee_id: string;
  member_name: string;
  member_name_mr?: string;
  position?: string;
  mobile?: string;
  joined_date?: string;
  order_index?: number;
  created_at?: string;
}

// ===== TAX & FINANCIAL MODULE =====
export interface PropertyTax {
  id: string;
  property_id: string;
  owner_name: string;
  owner_name_mr?: string;
  ward_number?: number;
  property_address?: string;
  property_type?: string;
  annual_tax_amount: number;
  arrears: number;
  total_due: number;
  last_paid_date?: string;
  mobile?: string;
  email?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WaterTax {
  id: string;
  connection_id: string;
  property_id?: string;
  owner_name: string;
  connection_type?: string;
  annual_tax_amount: number;
  arrears: number;
  total_due: number;
  last_paid_date?: string;
  is_active: boolean;
  created_at?: string;
}

export interface TaxPayment {
  id: string;
  transaction_id: string;
  payment_type: string;
  reference_id?: string;
  payer_name: string;
  amount: number;
  payment_method?: string;
  payment_gateway_response?: any;
  receipt_number?: string;
  fiscal_year?: string;
  payment_date?: string;
  status: string;
  created_at?: string;
}

export interface GPBudget {
  id: string;
  fiscal_year: string;
  budget_type?: string;
  total_receipts?: number;
  total_expenditure?: number;
  opening_balance?: number;
  closing_balance?: number;
  document_url?: string;
  approval_date?: string;
  gram_sabha_resolution?: string;
  created_at?: string;
}

export interface AuditReport {
  id: string;
  fiscal_year: string;
  audit_type?: string;
  audit_date?: string;
  auditor_name?: string;
  report_summary?: string;
  document_url?: string;
  status?: string;
  created_at?: string;
}

// ===== CITIZEN SERVICES MODULE =====
export interface CertificateApplication {
  id: string;
  application_number: string;
  certificate_type: string;
  applicant_name: string;
  applicant_name_mr?: string;
  father_name?: string;
  mobile: string;
  email?: string;
  address?: string;
  purpose?: string;
  supporting_documents?: any;
  status: string;
  applied_date?: string;
  processed_date?: string;
  issued_date?: string;
  rejection_reason?: string;
  certificate_url?: string;
  processed_by?: string;
  remarks?: string;
  created_at?: string;
}

export interface Grievance {
  id: string;
  ticket_number: string;
  complainant_name: string;
  mobile: string;
  email?: string;
  category?: string;
  subject: string;
  description: string;
  location?: string;
  photo_urls?: string[];
  priority: string;
  status: string;
  submitted_date?: string;
  assigned_to?: string;
  resolved_date?: string;
  resolution_details?: string;
  citizen_feedback?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DownloadableForm {
  id: string;
  title: string;
  title_mr?: string;
  description?: string;
  category?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  download_count: number;
  is_active: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

// ===== DEVELOPMENT WORKS MODULE =====
export interface DevelopmentWork {
  id: string;
  work_id: string;
  work_name: string;
  work_name_mr?: string;
  category?: string;
  work_type?: string;
  description?: string;
  location?: string;
  ward_number?: number;
  estimated_cost?: number;
  sanctioned_cost?: number;
  actual_cost?: number;
  funding_source?: string;
  contractor_name?: string;
  start_date?: string;
  completion_date?: string;
  expected_completion_date?: string;
  progress_percentage: number;
  status?: string;
  work_order_number?: string;
  work_order_date?: string;
  completion_certificate_url?: string;
  photo_urls?: string[];
  gpdp_year?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GPDPPlan {
  id: string;
  fiscal_year: string;
  plan_title?: string;
  total_budget?: number;
  approved_date?: string;
  gram_sabha_date?: string;
  document_url?: string;
  summary?: string;
  priority_sectors?: any;
  is_published: boolean;
  created_at?: string;
}

export interface Tender {
  id: string;
  tender_number: string;
  title: string;
  title_mr?: string;
  description?: string;
  work_category?: string;
  estimated_value?: number;
  emd_amount?: number;
  publication_date?: string;
  last_date_submission?: string;
  opening_date?: string;
  status?: string;
  tender_document_url?: string;
  technical_document_url?: string;
  winner_name?: string;
  winning_bid_amount?: number;
  award_date?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== SCHEMES MODULE =====
export interface Scheme {
  id: string;
  scheme_code?: string;
  scheme_name: string;
  scheme_name_mr?: string;
  scheme_type?: string;
  department?: string;
  description?: string;
  eligibility_criteria?: string;
  benefits?: string;
  how_to_apply?: string;
  required_documents?: any;
  scheme_url?: string;
  helpline?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  order_index?: number;
  created_at?: string;
}

export interface SchemeBeneficiary {
  id: string;
  scheme_id: string;
  beneficiary_name: string;
  beneficiary_name_mr?: string;
  father_name?: string;
  ward_number?: number;
  mobile?: string;
  benefit_amount?: number;
  sanction_date?: string;
  disbursement_date?: string;
  status?: string;
  remarks?: string;
  created_at?: string;
}

export interface BPLEntry {
  id: string;
  bpl_number: string;
  family_head_name: string;
  family_head_name_mr?: string;
  ward_number?: number;
  address?: string;
  family_members?: number;
  annual_income?: number;
  ration_card_type?: string;
  survey_year?: string;
  is_verified: boolean;
  created_at?: string;
}

// ===== TRANSPARENCY MODULE =====
export interface GramSabha {
  id: string;
  meeting_number: string;
  meeting_date: string;
  meeting_type?: string;
  venue?: string;
  attendees_count?: number;
  agenda?: string;
  resolutions?: string;
  minutes_document_url?: string;
  photo_urls?: string[];
  video_url?: string;
  created_at?: string;
}

export interface RTIInfo {
  id: string;
  designation?: string;
  officer_name: string;
  mobile?: string;
  email?: string;
  office_address?: string;
  office_hours?: string;
  order_index?: number;
  created_at?: string;
}

export interface DisclosureDocument {
  id: string;
  title: string;
  title_mr?: string;
  category?: string;
  description?: string;
  document_url: string;
  document_type?: string;
  file_size?: number;
  published_date?: string;
  fiscal_year?: string;
  is_public: boolean;
  download_count: number;
  created_at?: string;
}

// ===== GALLERY MODULE =====
export interface PhotoAlbum {
  id: string;
  album_name: string;
  album_name_mr?: string;
  description?: string;
  cover_photo_url?: string;
  event_date?: string;
  photo_count: number;
  order_index?: number;
  is_published: boolean;
  created_at?: string;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  title?: string;
  photo_url: string;
  thumbnail_url?: string;
  description?: string;
  captured_date?: string;
  order_index?: number;
  views_count: number;
  created_at?: string;
}

export interface GalleryVideo {
  id: string;
  title: string;
  title_mr?: string;
  description?: string;
  video_url: string;
  video_type?: string;
  thumbnail_url?: string;
  duration?: number;
  event_date?: string;
  views_count: number;
  order_index?: number;
  is_published: boolean;
  created_at?: string;
}

// ===== CONTENT & CONFIGURATION =====
export interface SarpanchMessage {
  id: string;
  message_title?: string;
  message_text: string;
  message_text_mr?: string;
  sarpanch_name?: string;
  sarpanch_photo_url?: string;
  is_active: boolean;
  display_from?: string;
  display_until?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FlashNews {
  id: string;
  news_text: string;
  news_text_mr?: string;
  news_type?: string;
  priority: string;
  is_active: boolean;
  display_from?: string;
  display_until?: string;
  order_index?: number;
  created_at?: string;
}

export interface VillageStat {
  id: string;
  stat_key: string;
  stat_value: string;
  stat_label?: string;
  stat_label_mr?: string;
  data_source?: string;
  last_updated?: string;
  display_order?: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VillageInfo {
  id: string;
  info_type?: string;
  title?: string;
  title_mr?: string;
  content?: string;
  content_mr?: string;
  images?: string[];
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  id: string;
  contact_type?: string;
  label: string;
  label_mr?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  timings?: string;
  order_index?: number;
  is_active: boolean;
  created_at?: string;
}

// ===== LEGACY TYPES (for backward compatibility) =====
export interface Content {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'image' | 'document' | 'youtube' | 'text';
  url: string;
  category_id: string;
  is_protected: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  section_id?: string;
  detailed_info?: string;
  is_featured?: boolean;
  featured_order?: number;
  video_duration?: number | null;
  file_size?: number | null;
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  category_id?: string;
  is_featured?: boolean;
  featured_order?: number;
}

export interface Category {
  id: string;
  name: string;
  name_hi: string;
  description?: string;
  created_at: string;
}

export interface AccessRequest {
  id: string;
  content_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  content_title?: string;
  user_full_name?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

// ===== LANGUAGE SUPPORT =====
export type Language = 'en' | 'mr' | 'hi'; // English, Marathi and Hindi

export interface BilingualText {
  en: string;
  mr?: string;
}

// ===== DASHBOARD STATS =====
export interface DashboardStats {
  population: {
    total: number;
    male: number;
    female: number;
  };
  tax_collection: {
    target: number;
    collected: number;
    percentage: number;
  };
  cleanliness_rating?: number;
  active_grievances: number;
  pending_certificates: number;
  ongoing_works: number;
}
