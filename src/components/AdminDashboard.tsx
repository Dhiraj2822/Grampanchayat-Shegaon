/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Check, X, Eye, Calendar, User, Phone, Image, Video, Users, Award, Newspaper, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  isMarathi: boolean;
  onNavigate: (page: string) => void;
}

interface PendingCertificate {
  id: string;
  application_number: string;
  certificate_type: string;
  form_data: any;
  proof_urls?: any;
  created_at: string;
  full_name: string;
  mobile: string;
}

interface PendingComplaint {
  id: string;
  complaint_number: string;
  category: string;
  title: string;
  description: string;
  photo_evidence_url?: string;
  location?: string;
  priority: string;
  created_at: string;
  full_name: string;
  mobile: string;
}

// Helper function to get table name from certificate type
const getCertificateTableName = (certificateType: string): string => {
  const typeMap: Record<string, string> = {
    'BIRTH': 'cit_birth_certificate',
    'Birth Certificate': 'cit_birth_certificate',
    'DEATH': 'cit_death_certificate',
    'Death Certificate': 'cit_death_certificate',
    'MARRIAGE': 'cit_marriage_certificate',
    'Marriage Certificate': 'cit_marriage_certificate',
    'BPL': 'cit_bpl_certificate',
    'BPL Certificate': 'cit_bpl_certificate',
    'NO_DUES': 'cit_no_dues_certificate',
    'No Dues Certificate': 'cit_no_dues_certificate',
    'PROPERTY_TAX': 'cit_property_tax_extract',
    'Property Tax Extract': 'cit_property_tax_extract',
    'DESTITUTE': 'cit_destitute_certificate',
    'Destitute Certificate': 'cit_destitute_certificate',
  };
  return typeMap[certificateType] || 'cit_birth_certificate';
};

// Helper function to safely parse form_data whether it's a string or object
const parseFormData = (formData: any): any => {
  if (typeof formData === 'string') {
    try {
      return JSON.parse(formData);
    } catch (error) {
      console.error('Error parsing form_data:', error);
      return {};
    }
  }
  return formData || {};
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isMarathi, onNavigate }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'certificates' | 'complaints'>('certificates');
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [pendingComplaints, setPendingComplaints] = useState<PendingComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'certificate' | 'complaint' | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'resolve' | 'approve_payment' | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
      fetchAdminData();
    }
  }, [user, profile]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch pending certificates using the view
      const { data: certificates, error: certError } = await supabase
        .from('admin_pending_certificates')
        .select('*');

      if (certError) throw certError;
      setPendingCertificates(certificates || []);

      // Fetch open complaints using the view
      const { data: complaints, error: compError } = await supabase
        .from('admin_open_complaints')
        .select('*');

      if (compError) throw compError;
      setPendingComplaints(complaints || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateAction = async (certificateId: string, action: 'approve' | 'reject' | 'approve_payment') => {
    try {
      setProcessing(true);
      let documentUrl = '';

      if ((action === 'approve' || action === 'approve_payment') && uploadedFile) {
        // Validate file size (10MB limit for signed certificates)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
          throw new Error(isMarathi 
            ? 'फाइल 10MB पेक्षा कमी असावी' 
            : 'File size must be less than 10MB');
        }

        // Upload the signed certificate
        // Sanitize filename to avoid issues with special characters
        const sanitizedName = uploadedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `certificates/${Date.now()}_${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;
        
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        documentUrl = publicUrlData.publicUrl;
      }

      // Get the correct table name based on certificate type
      const tableName = getCertificateTableName(selectedItem?.certificate_type || '');
      
      // Update the certificate in the correct table
      let status = 'Pending';
      if (action === 'approve') status = 'Approved';
      else if (action === 'reject') status = 'Rejected';
      else if (action === 'approve_payment') status = 'Approved - Payment Pending';

      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if ((action === 'approve' || action === 'approve_payment') && documentUrl) {
        updateData.signed_document_url = documentUrl;
      }
      
      if ((action === 'reject' || action === 'approve_payment') && remarkText) {
        updateData.admin_remark = remarkText;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', certificateId);

      if (error) throw error;

      let successMessage = '';
      if (action === 'approve') successMessage = isMarathi ? 'प्रमाणपत्र मंजूर झाले!' : 'Certificate approved!';
      else if (action === 'reject') successMessage = isMarathi ? 'प्रमाणपत्र नाकारले!' : 'Certificate rejected!';
      else if (action === 'approve_payment') successMessage = isMarathi ? 'पेमेंट विनंती पाठवली!' : 'Payment request sent!';

      alert(successMessage);
      
      setSelectedItem(null);
      setModalType(null);
      setActionType(null);
      setRemarkText('');
      setUploadedFile(null);
      fetchAdminData();

    } catch (error: any) {
      console.error('Error processing certificate:', error);
      alert(isMarathi 
        ? `त्रुटी आली: ${error.message || 'any error'}` 
        : `Error occurred: ${error.message || 'any error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleComplaintResolve = async (complaintId: string) => {
    try {
      setProcessing(true);

      const { error } = await supabase
        .from('cit_complaints')
        .update({
          status: 'Resolved',
          resolution_note: remarkText,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      alert(isMarathi ? 'तक्रार निराकरण झाली!' : 'Complaint resolved!');
      
      setSelectedItem(null);
      setModalType(null);
      setActionType(null);
      setRemarkText('');
      fetchAdminData();

    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert(isMarathi ? 'त्रुटी आली!' : 'Error occurred!');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCertificateDetails = (formData: any, certificateType: string) => {
    switch (certificateType) {
      case 'BIRTH':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Child Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Name (English):</strong> {formData.child_name_en}</div>
              <div><strong>Name (Marathi):</strong> {formData.child_name_mr}</div>
              <div><strong>Date of Birth:</strong> {formData.date_of_birth}</div>
              <div><strong>Place of Birth:</strong> {formData.place_of_birth}</div>
              <div><strong>Gender:</strong> {formData.gender}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Parents Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Father (EN):</strong> {formData.father_name_en}</div>
              <div><strong>Father (MR):</strong> {formData.father_name_mr}</div>
              <div><strong>Mother (EN):</strong> {formData.mother_name_en}</div>
              <div><strong>Mother (MR):</strong> {formData.mother_name_mr}</div>
              <div><strong>Parent Aadhaar:</strong> {formData.parent_aadhaar || 'Not provided'}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            {formData.proof_of_birth_url ? (
              <a href={formData.proof_of_birth_url} target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                📄 View Proof of Birth
              </a>
            ) : (
              <span className="text-gray-500">No document uploaded</span>
            )}
          </div>
        );
        
      case 'DEATH':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Deceased Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name (English):</strong> {formData.deceased_name_en}</div>
              <div><strong>Name (Marathi):</strong> {formData.deceased_name_mr}</div>
              <div><strong>Date of Death:</strong> {formData.date_of_death}</div>
              <div><strong>Place of Death:</strong> {formData.place_of_death}</div>
              <div><strong>Age at Death:</strong> {formData.age_at_death}</div>
              <div><strong>Cause of Death:</strong> {formData.cause_of_death}</div>
              <div><strong>Aadhaar Number:</strong> {formData.deceased_aadhaar}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            {formData.proof_of_death_url ? (
              <a href={formData.proof_of_death_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                📄 View Proof of Death (Doctor's Certificate/Panchnama)
              </a>
            ) : (
              <span className="text-gray-500">No document uploaded</span>
            )}
          </div>
        );
        
      case 'MARRIAGE':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Husband Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name (English):</strong> {formData.husband_name_en}</div>
              <div><strong>Name (Marathi):</strong> {formData.husband_name_mr}</div>
              <div><strong>Aadhaar:</strong> {formData.husband_aadhaar}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Wife Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name Before Marriage (EN):</strong> {formData.wife_name_before_en}</div>
              <div><strong>Name Before Marriage (MR):</strong> {formData.wife_name_before_mr}</div>
              <div><strong>Name After Marriage (EN):</strong> {formData.wife_name_after_en}</div>
              <div><strong>Name After Marriage (MR):</strong> {formData.wife_name_after_mr}</div>
              <div><strong>Aadhaar:</strong> {formData.wife_aadhaar}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Marriage Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Date of Marriage:</strong> {formData.date_of_marriage}</div>
              <div><strong>Place of Marriage:</strong> {formData.place_of_marriage}</div>
              <div><strong>Priest Name:</strong> {formData.priest_name || 'Not provided'}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            <div className="flex flex-wrap gap-4">
              {formData.joint_photo_url && (
                <a href={formData.joint_photo_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📷 Joint Photo
                </a>
              )}
              {formData.invitation_card_url && (
                <a href={formData.invitation_card_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📄 Invitation Card
                </a>
              )}
              {formData.aadhaar_cards_url && (
                <a href={formData.aadhaar_cards_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📄 Aadhaar Cards
                </a>
              )}
            </div>
          </div>
        );
        
      case 'BPL':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Family Head Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Name (English):</strong> {formData.head_name_en}</div>
              <div><strong>Name (Marathi):</strong> {formData.head_name_mr}</div>
              <div><strong>BPL List Number:</strong> {formData.bpl_list_number}</div>
              <div><strong>Ration Card Number:</strong> {formData.ration_card_number}</div>
              <div><strong>Aadhaar Number:</strong> {formData.aadhaar_number || 'Not provided'}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            {formData.ration_card_url ? (
              <a href={formData.ration_card_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                📄 Ration Card Copy
              </a>
            ) : (
              <span className="text-gray-500">No document uploaded</span>
            )}
          </div>
        );
        
      case 'PROPERTY_TAX':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Property Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Property Number:</strong> {formData.property_number}</div>
              <div><strong>Ward Number:</strong> {formData.ward_number || 'Not provided'}</div>
              <div><strong>Owner Name (English):</strong> {formData.owner_name_en}</div>
              <div><strong>Owner Name (Marathi):</strong> {formData.owner_name_mr}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            {formData.identity_proof_url ? (
              <a href={formData.identity_proof_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                📄 Identity Proof
              </a>
            ) : (
              <span className="text-gray-500">No document uploaded</span>
            )}
          </div>
        );
        
      case 'DESTITUTE':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Beneficiary Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Name (English):</strong> {formData.beneficiary_name_en}</div>
              <div><strong>Name (Marathi):</strong> {formData.beneficiary_name_mr}</div>
              <div><strong>Date of Birth:</strong> {formData.date_of_birth || 'Not provided'}</div>
              <div><strong>Age:</strong> {formData.age || 'Not provided'}</div>
              <div><strong>Aadhaar Number:</strong> {formData.aadhaar_number}</div>
              <div><strong>Ration Card Number:</strong> {formData.ration_card_number || 'Not provided'}</div>
              <div><strong>Occupation:</strong> {formData.occupation || 'Not provided'}</div>
              <div><strong>Annual Income:</strong> ₹{formData.annual_income || 'Not provided'}</div>
            </div>
            
            <h4 className="font-semibold text-gray-700 border-b pb-2 mt-4">Uploaded Documents</h4>
            <div className="flex flex-wrap gap-4">
              {formData.age_proof_url && (
                <a href={formData.age_proof_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📄 Age Proof
                </a>
              )}
              {formData.income_certificate_url && (
                <a href={formData.income_certificate_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📄 Income Certificate
                </a>
              )}
              {formData.disability_certificate_url && (
                <a href={formData.disability_certificate_url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  📄 Disability Certificate
                </a>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(formData || {}).map(([key, value]) => (
              <div key={key}>
                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong>{' '}
                {typeof value === 'string' && value.startsWith('http') ? (
                  <a href={value} target="_blank" className="text-blue-600">View</a>
                ) : (
                  String(value) || 'N/A'
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  // Check if user is admin
  if (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isMarathi ? 'प्रवेश नाकारला' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isMarathi ? 'हे पान केवळ प्रशासकांसाठी आहे' : 'This page is for administrators only'}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isMarathi ? 'मुख्यपृष्ठावर जा' : 'Go to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isMarathi ? 'प्रशासन डॅशबोर्ड' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isMarathi ? 'अर्ज, तक्रारी आणि वेबसाइट सामग्री व्यवस्थापित करा' : 'Manage Applications, Complaints & Website Content'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← {isMarathi ? 'मुख्यपृष्ठावर जा' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Management Quick Access - For Admin */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-4">
            {isMarathi ? '📝 वेबसाइट सामग्री व्यवस्थापन' : '📝 Website Content Management'}
          </h2>
          <p className="text-green-100 mb-4">
            {isMarathi 
              ? 'फोटो, व्हिडिओ, निवडून आलेले सदस्य, कर्मचारी आणि इतर माहिती अपडेट करा' 
              : 'Update photos, videos, elected members, staff and other information'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigate('content-management?section=gallery')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Image className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'फोटो' : 'Photos'}</span>
            </button>
            <button
              onClick={() => onNavigate('content-management?section=video-gallery')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Video className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'व्हिडिओ' : 'Videos'}</span>
            </button>
            <button
              onClick={() => onNavigate('content-management?section=elected-officials')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Users className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'सदस्य' : 'Members'}</span>
            </button>
            <button
              onClick={() => onNavigate('content-management?section=staff-members')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'कर्मचारी' : 'Staff'}</span>
            </button>
            <button
              onClick={() => onNavigate('content-management?section=schemes')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Award className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'योजना' : 'Schemes'}</span>
            </button>
            <button
              onClick={() => onNavigate('content-management?section=news-announcements')}
              className="flex flex-col items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Newspaper className="w-6 h-6 mb-1" />
              <span className="text-sm">{isMarathi ? 'बातम्या' : 'News'}</span>
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={() => onNavigate('content-management')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 transition"
            >
              <Settings className="w-4 h-4" />
              {isMarathi ? 'सर्व सामग्री व्यवस्थापित करा' : 'Manage All Content'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isMarathi ? 'प्रलंबित प्रमाणपत्रे' : 'Pending Certificates'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{pendingCertificates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isMarathi ? 'मुक्त तक्रारी' : 'Open Complaints'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{pendingComplaints.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                {isMarathi ? 'प्रमाणपत्र डेस्क' : 'Certificate Desk'}
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                {isMarathi ? 'तक्रार डेस्क' : 'Grievance Desk'}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">
                  {isMarathi ? 'लोड करत आहे...' : 'Loading...'}
                </p>
              </div>
            ) : (
              <>
                {/* Certificate Desk */}
                {activeTab === 'certificates' && (
                  <div>
                    {pendingCertificates.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {isMarathi ? 'कोणतेही प्रलंबित अर्ज नाहीत' : 'No Pending Applications'}
                        </h3>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isMarathi ? 'अर्जदार' : 'Applicant'}
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isMarathi ? 'प्रमाणपत्र प्रकार' : 'Certificate Type'}
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isMarathi ? 'अर्ज क्रमांक' : 'Application No'}
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isMarathi ? 'तारीख' : 'Date'}
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isMarathi ? 'कृती' : 'Actions'}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {pendingCertificates.map((cert) => (
                              <tr key={cert.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <User className="w-5 h-5 text-gray-400 mr-2" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{cert.full_name}</div>
                                      <div className="text-sm text-gray-500">{cert.mobile}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {cert.certificate_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {cert.application_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(cert.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(cert);
                                      setModalType('certificate');
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    {isMarathi ? 'पहा' : 'View'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Complaints Desk */}
                {activeTab === 'complaints' && (
                  <div>
                    {pendingComplaints.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {isMarathi ? 'कोणत्या मुक्त तक्रारी नाहीत' : 'No Open Complaints'}
                        </h3>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingComplaints.map((complaint) => (
                          <div key={complaint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-800">{complaint.title}</h3>
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                    {complaint.priority}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Complaint No:</strong> {complaint.complaint_number}</p>
                                    <p><strong>Category:</strong> {complaint.category}</p>
                                    <p><strong>Location:</strong> {complaint.location || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Complainant:</strong> {complaint.full_name}</p>
                                    <p><strong>Mobile:</strong> {complaint.mobile}</p>
                                    <p><strong>Filed On:</strong> {formatDate(complaint.created_at)}</p>
                                  </div>
                                </div>

                                <p className="text-gray-700 mb-3">{complaint.description}</p>

                                {complaint.photo_evidence_url && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Photo Evidence:</p>
                                    <img
                                      src={complaint.photo_evidence_url}
                                      alt="Evidence"
                                      className="max-w-xs rounded-lg border"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="ml-4">
                                <button
                                  onClick={() => {
                                    setSelectedItem(complaint);
                                    setModalType('complaint');
                                    setActionType('resolve');
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  {isMarathi ? 'निराकरण करा' : 'Resolve'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Certificate Details and Actions */}
      {modalType === 'certificate' && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">
                {selectedItem.certificate_type} Certificate Application
              </h2>
              <p className="text-blue-100">Application No: {selectedItem.application_number}</p>
            </div>

            <div className="p-6">
              {/* Applicant Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  {isMarathi ? 'अर्जदाराची माहिती' : 'Applicant Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <User className="w-4 h-4 inline mr-2 text-gray-500" />
                    <span className="font-medium">{selectedItem.full_name}</span>
                  </div>
                  <div>
                    <Phone className="w-4 h-4 inline mr-2 text-gray-500" />
                    <span>{selectedItem.mobile}</span>
                  </div>
                  <div>
                    <Calendar className="w-4 h-4 inline mr-2 text-gray-500" />
                    <span>{formatDate(selectedItem.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  {isMarathi ? 'प्रमाणपत्र तपशील' : 'Certificate Details'}
                </h3>
                {renderCertificateDetails(parseFormData(selectedItem.form_data), selectedItem.certificate_type)}
              </div>

              {/* Action Buttons */}
              {!actionType && (
                <div className="flex gap-4 justify-end flex-wrap">
                  <button
                    onClick={() => setActionType('reject')}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {isMarathi ? 'नाकारा' : 'Reject'}
                  </button>
                  <button
                    onClick={() => setActionType('approve_payment')}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {isMarathi ? 'मंजूर आणि पेमेंट' : 'Approve & Request Payment'}
                  </button>
                  <button
                    onClick={() => setActionType('approve')}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {isMarathi ? 'थेट मंजूर करा' : 'Direct Approve'}
                  </button>
                </div>
              )}

              {/* Approve Payment Action */}
              {actionType === 'approve_payment' && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {isMarathi ? 'पेमेंट विनंती तपशील' : 'Payment Request Details'}
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isMarathi ? 'संदेश (पर्यायी)' : 'Message to User (Optional)'}
                    </label>
                    <textarea
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder={isMarathi ? 'उदा. प्रमाणपत्र तयार आहे, कृपया शुल्क भरा...' : 'e.g. Certificate is ready, please pay the fees...'}
                      className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isMarathi ? 'स्वाक्षरित प्रमाणपत्र अपलोड करा (पर्यायी)' : 'Upload Signed Certificate (Optional)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isMarathi ? 'कमाल आकार: 10MB. फक्त PDF.' : 'Max size: 10MB. PDF only.'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setActionType(null)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {isMarathi ? 'रद्द करा' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleCertificateAction(selectedItem.id, 'approve_payment')}
                      disabled={processing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? (isMarathi ? 'प्रक्रिया...' : 'Processing...') : (isMarathi ? 'विनंती पाठवा' : 'Send Request')}
                    </button>
                  </div>
                </div>
              )}

              {/* Approve Action */}
              {actionType === 'approve' && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {isMarathi ? 'स्वाक्षरित प्रमाणपत्र अपलोड करा' : 'Upload Signed Certificate'}
                  </h4>
                  <div className="mb-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isMarathi ? 'कमाल आकार: 10MB. फक्त PDF.' : 'Max size: 10MB. PDF only.'}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActionType(null)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {isMarathi ? 'रद्द करा' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleCertificateAction(selectedItem.id, 'approve')}
                      disabled={!uploadedFile || processing}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? (isMarathi ? 'प्रक्रिया...' : 'Processing...') : (isMarathi ? 'मंजूर करा' : 'Approve')}
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Action */}
              {actionType === 'reject' && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {isMarathi ? 'नाकारण्याचे कारण' : 'Rejection Reason'}
                  </h4>
                  <div className="mb-4">
                    <textarea
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder={isMarathi ? 'नाकारण्याचे कारण लिहा...' : 'Enter rejection reason...'}
                      className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActionType(null)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {isMarathi ? 'रद्द करा' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleCertificateAction(selectedItem.id, 'reject')}
                      disabled={!remarkText.trim() || processing}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? (isMarathi ? 'प्रक्रिया...' : 'Processing...') : (isMarathi ? 'नाकारा' : 'Reject')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType(null);
                  setActionType(null);
                  setRemarkText('');
                  setUploadedFile(null);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                {isMarathi ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Complaint Resolution */}
      {modalType === 'complaint' && selectedItem && actionType === 'resolve' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">
                {isMarathi ? 'तक्रार निराकरण' : 'Resolve Complaint'}
              </h2>
              <p className="text-green-100">Complaint No: {selectedItem.complaint_number}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">{selectedItem.title}</h3>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isMarathi ? 'निराकरणाची टिप्पणी' : 'Resolution Comments'}
                </label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder={isMarathi ? 'निराकरणाची माहिती लिहा...' : 'Enter resolution details...'}
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setModalType(null);
                    setActionType(null);
                    setRemarkText('');
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleComplaintResolve(selectedItem.id)}
                  disabled={!remarkText.trim() || processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (isMarathi ? 'प्रक्रिया...' : 'Processing...') : (isMarathi ? 'निराकरण करा' : 'Mark as Resolved')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;