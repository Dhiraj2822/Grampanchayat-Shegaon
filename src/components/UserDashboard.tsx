/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Download, Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserDashboardProps {
  isMarathi: boolean;
  onNavigate: (page: string) => void;
}

interface ServiceRequest {
  id: string;
  application_number: string;
  certificate_type: string;
  form_data: any;
  status: 'Submitted' | 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  admin_remark?: string;
  signed_document_url?: string;
  created_at: string;
}

interface Complaint {
  id: string;
  complaint_number: string;
  category: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolution_remark?: string;
  created_at: string;
  priority: string;
}

// Define certificate types and their corresponding tables
const CERTIFICATE_TABLES = [
  { table: 'cit_birth_certificate', type: 'Birth Certificate' },
  { table: 'cit_death_certificate', type: 'Death Certificate' },
  { table: 'cit_marriage_certificate', type: 'Marriage Certificate' },
  { table: 'cit_bpl_certificate', type: 'BPL Certificate' },
  { table: 'cit_no_dues_certificate', type: 'No Dues Certificate' },
  { table: 'cit_property_tax_extract', type: 'Property Tax Extract' },
  { table: 'cit_destitute_certificate', type: 'Destitute Certificate' },
];

const UserDashboard: React.FC<UserDashboardProps> = ({ isMarathi, onNavigate }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'complaints'>('applications');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user data for:', user?.id);

      // Fetch certificates from all cit_* tables
      const allCertificates: ServiceRequest[] = [];
      
      for (const certTable of CERTIFICATE_TABLES) {
        const { data, error } = await supabase
          .from(certTable.table)
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${certTable.table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            application_number: item.application_number,
            certificate_type: certTable.type,
            form_data: item.form_data,
            status: item.status || 'Submitted',
            admin_remark: item.admin_remark,
            signed_document_url: item.signed_document_url,
            created_at: item.created_at,
          }));
          allCertificates.push(...mapped);
        }
      }

      // Sort all certificates by created_at descending
      allCertificates.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setServiceRequests(allCertificates);

      // Fetch complaints from cit_complaints table
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('cit_complaints')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (complaintsError) {
        console.error('Complaints error:', complaintsError);
        setComplaints([]);
      } else {
        // Map complaints to expected format
        const mappedComplaints = (complaintsData || []).map((c: any) => ({
          id: c.id,
          complaint_number: c.id,
          category: 'General',
          title: c.subject,
          description: c.description,
          status: c.status || 'Open',
          resolution_remark: c.resolution_note,
          created_at: c.created_at,
          priority: 'Normal'
        }));
        setComplaints(mappedComplaints);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      setServiceRequests([]);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Open':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'In Progress':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'Approved':
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
      case 'Closed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = async (documentUrl: string, applicationNumber: string) => {
    try {
      // The documentUrl is now a full public URL, just open it in new tab
      if (documentUrl.startsWith('http')) {
        window.open(documentUrl, '_blank');
      } else {
        // Fallback: download from storage
        const { data, error } = await supabase.storage
          .from('uploads')
          .download(documentUrl);

        if (error) throw error;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${applicationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(isMarathi ? 'प्रमाणपत्र डाउनलोड करताना त्रुटी' : 'Error downloading certificate');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isMarathi ? 'कृपया लॉगिन करा' : 'Please Login'}
          </h2>
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
                {isMarathi ? 'माझे डॅशबोर्ड' : 'My Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isMarathi ? `नमस्कार, ${profile?.full_name}` : `Welcome, ${profile?.full_name}`}
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

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                {isMarathi ? 'माझे अर्ज' : 'My Applications'}
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {serviceRequests.length}
                </span>
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
                {isMarathi ? 'माझे तक्रारी' : 'My Complaints'}
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {complaints.length}
                </span>
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
                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div>
                    {serviceRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {isMarathi ? 'कोणतेही अर्ज नाहीत' : 'No Applications'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {isMarathi ? 'तुम्ही अद्याप कोणताही अर्ज सबमिट केलेला नाही.' : 'You haven\'t submitted any applications yet.'}
                        </p>
                        <button
                          onClick={() => onNavigate('certificates')}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {isMarathi ? 'प्रमाणपत्रासाठी अर्ज करा' : 'Apply for Certificate'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {serviceRequests.map((request) => (
                          <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    {request.certificate_type.replace('_', ' ')} Certificate
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                    {getStatusIcon(request.status)}
                                    <span className="ml-1">{request.status}</span>
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Application Number:</strong> {request.application_number}</p>
                                  <p><strong>Applied On:</strong> {formatDate(request.created_at)}</p>
                                </div>

                                {/* Show admin remark for rejected applications */}
                                {request.status === 'Rejected' && request.admin_remark && (
                                  <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                                    <p className="text-sm text-red-700">
                                      <strong>{isMarathi ? 'नाकारण्याचे कारण:' : 'Rejection Reason:'}</strong> {request.admin_remark}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 ml-4">
                                {/* Download certificate button for approved applications */}
                                {request.status === 'Approved' && request.signed_document_url && (
                                  <button
                                    onClick={() => handleDownloadCertificate(request.signed_document_url!, request.application_number)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    {isMarathi ? 'डाउनलोड' : 'Download'}
                                  </button>
                                )}

                                {/* View details button */}
                                <button onClick={() => setSelectedRequest(request)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Eye className="w-4 h-4" />
                                  {isMarathi ? 'तपशील' : 'Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Details Modal */}
                {selectedRequest && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="bg-blue-600 text-white p-6 rounded-t-xl">
                        <h2 className="text-2xl font-bold">{isMarathi ? 'प्रमाणपत्र तपशील' : 'Certificate Details'}</h2>
                        <p className="text-blue-100 mt-1">{selectedRequest.application_number} • {selectedRequest.certificate_type}</p>
                      </div>
                      <div className="p-6">
                        <div className="mb-4">
                          <p><strong>{isMarathi ? 'स्थिती:' : 'Status:'}</strong> {selectedRequest.status}</p>
                          <p><strong>{isMarathi ? 'लागू तारीख:' : 'Applied On:'}</strong> {new Date(selectedRequest.created_at).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">{isMarathi ? 'फॉर्म तपशील' : 'Form Data'}</h4>
                          <div className="text-sm text-gray-700">
                            {Object.entries(selectedRequest.form_data || {}).map(([k, v]) => (
                              <div key={k} className="mb-1"><strong>{k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {' '}{typeof v === 'string' && v.startsWith('http') ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a> : String(v)}</div>
                            ))}
                          </div>
                        </div>
                        {selectedRequest.status === 'Approved' && selectedRequest.signed_document_url && (
                          <div className="flex gap-2">
                            <button onClick={() => handleDownloadCertificate(selectedRequest.signed_document_url!, selectedRequest.application_number)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{isMarathi ? 'डाउनलोड' : 'Download'}</button>
                            <a href={selectedRequest.signed_document_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">{isMarathi ? 'उघडा' : 'Open'}</a>
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
                        <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">{isMarathi ? 'बंद करा' : 'Close'}</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                  <div>
                    {complaints.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {isMarathi ? 'कोणत्या तक्रारी नाहीत' : 'No Complaints'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {isMarathi ? 'तुम्ही अद्याप कोणतीही तक्रार नोंदवली नाही.' : 'You haven\'t filed any complaints yet.'}
                        </p>
                        <button
                          onClick={() => onNavigate('grievance')}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {isMarathi ? 'तक्रार नोंदवा' : 'File Complaint'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {complaints.map((complaint) => (
                          <div key={complaint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-800">{complaint.title}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                                    {getStatusIcon(complaint.status)}
                                    <span className="ml-1">{complaint.status}</span>
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {complaint.priority}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Complaint Number:</strong> {complaint.complaint_number}</p>
                                  <p><strong>Category:</strong> {complaint.category}</p>
                                  <p><strong>Filed On:</strong> {formatDate(complaint.created_at)}</p>
                                </div>

                                <p className="text-gray-700 mt-2">{complaint.description}</p>

                                {/* Show resolution for resolved complaints */}
                                {complaint.status === 'Resolved' && complaint.resolution_remark && (
                                  <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                                    <p className="text-sm text-green-700">
                                      <strong>{isMarathi ? 'निराकरण:' : 'Resolution:'}</strong> {complaint.resolution_remark}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="ml-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Eye className="w-4 h-4" />
                                  {isMarathi ? 'तपशील' : 'Details'}
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
    </div>
  );
};

export default UserDashboard;