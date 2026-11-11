/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Language } from '../types';
import FileUpload from './FileUpload';

interface CertificateFormsPageProps {
  language: Language;
  onBack: () => void;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
  certificateType?: string;
}

type CertificateType = 'birth' | 'death' | 'marriage' | 'bpl' | 'property-tax' | 'destitute';

const CertificateFormsPage: React.FC<CertificateFormsPageProps> = ({ language, onBack, onNavigate, certificateType }) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<CertificateType | ''>(
    (certificateType as CertificateType) || ''
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Uploading state removed - not used in component

  // Form data for each certificate type
  const [formData, setFormData] = useState<Record<string, string>>({});

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  // Validation helpers
  const validateMobile = (mobile: string): boolean => /^[0-9]{10}$/.test(mobile);

  const certificateTypes = [
    { id: 'birth', name: t('Birth Certificate', '???? ?????????? (???? ????)'), icon: '??' },
    { id: 'death', name: t('Death Certificate', '?????? ?????????? (?????? ????)'), icon: '??' },
    { id: 'marriage', name: t('Marriage Certificate', '????? ?????????? (????? ????)'), icon: '??' },
    { id: 'bpl', name: t('BPL Certificate', '????? ???????? ??????????'), icon: '??' },
    { id: 'property-tax', name: t('Property Tax Extract (No Dues)', '??????? ?? ?????? (???? ????)'), icon: '??' },
    { id: 'destitute', name: t('Destitute Certificate', '?????? ??????????'), icon: '??' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Application number generator
  const generateApplicationNumber = (certificateType: string) => {
    const prefix = certificateType.toUpperCase().substring(0, 3);
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${year}-${random}`;
  };

  const validateForm = (): boolean => {
    // Mobile validation for all forms
    if (!formData.mobile || !validateMobile(formData.mobile)) {
      setError(t('Mobile number must be exactly 10 digits', '??? ???? ?? ???? ???? ?????? ???'));
      return false;
    }

    if (!formData.applicant_name?.trim()) {
      setError(t('Applicant name is required', '????????? ??? ?????? ???'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const applicationNumber = generateApplicationNumber(selectedType);
      let tableName = '';
      let insertData: Record<string, any> = {
        status: 'Submitted',
        user_id: user?.id || null,
        application_number: applicationNumber,
      };

      switch (selectedType) {
        case 'birth':
          tableName = 'cit_birth_certificate';
          insertData = {
            ...insertData,
            child_name_en: formData.child_name_en,
            child_name_mr: formData.child_name_mr,
            date_of_birth: formData.date_of_birth,
            place_of_birth: formData.place_of_birth,
            gender: formData.gender,
            father_name_en: formData.father_name_en,
            father_name_mr: formData.father_name_mr,
            mother_name_en: formData.mother_name_en,
            mother_name_mr: formData.mother_name_mr,
            parent_aadhaar: formData.parent_aadhaar,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            proof_of_birth_url: formData.proof_of_birth_url,
          };
          break;

        case 'death':
          tableName = 'cit_death_certificate';
          insertData = {
            ...insertData,
            deceased_name_en: formData.deceased_name_en,
            deceased_name_mr: formData.deceased_name_mr,
            date_of_death: formData.date_of_death,
            place_of_death: formData.place_of_death,
            age_at_death: parseInt(formData.age_at_death) || 0,
            cause_of_death: formData.cause_of_death,
            deceased_aadhaar: formData.deceased_aadhaar,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            proof_of_death_url: formData.proof_of_death_url,
          };
          break;

        case 'marriage':
          tableName = 'cit_marriage_certificate';
          insertData = {
            ...insertData,
            husband_name_en: formData.husband_name_en,
            husband_name_mr: formData.husband_name_mr,
            husband_aadhaar: formData.husband_aadhaar,
            wife_name_before_en: formData.wife_name_before_en,
            wife_name_before_mr: formData.wife_name_before_mr,
            wife_name_after_en: formData.wife_name_after_en,
            wife_name_after_mr: formData.wife_name_after_mr,
            wife_aadhaar: formData.wife_aadhaar,
            date_of_marriage: formData.date_of_marriage,
            place_of_marriage: formData.place_of_marriage,
            priest_name: formData.priest_name,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            joint_photo_url: formData.joint_photo_url,
            invitation_card_url: formData.invitation_card_url,
            aadhaar_cards_url: formData.aadhaar_cards_url,
          };
          break;

        case 'bpl':
          tableName = 'cit_bpl_certificate';
          insertData = {
            ...insertData,
            head_name_en: formData.head_name_en,
            head_name_mr: formData.head_name_mr,
            bpl_list_number: formData.bpl_list_number,
            ration_card_number: formData.ration_card_number,
            aadhaar_number: formData.aadhaar_number,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            ration_card_url: formData.ration_card_url,
          };
          break;

        case 'property-tax':
          tableName = 'cit_property_tax_extract';
          insertData = {
            ...insertData,
            property_number: formData.property_number,
            owner_name_en: formData.owner_name_en,
            owner_name_mr: formData.owner_name_mr,
            ward_number: formData.ward_number,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            identity_proof_url: formData.identity_proof_url,
          };
          break;

        case 'destitute':
          tableName = 'cit_destitute_certificate';
          insertData = {
            ...insertData,
            beneficiary_name_en: formData.beneficiary_name_en,
            beneficiary_name_mr: formData.beneficiary_name_mr,
            date_of_birth: formData.date_of_birth,
            age: parseInt(formData.age) || null,
            aadhaar_number: formData.aadhaar_number,
            ration_card_number: formData.ration_card_number,
            occupation: formData.occupation,
            annual_income: parseFloat(formData.annual_income) || null,
            applicant_name: formData.applicant_name,
            mobile: formData.mobile,
            age_proof_url: formData.age_proof_url,
            income_certificate_url: formData.income_certificate_url,
            disability_certificate_url: formData.disability_certificate_url,
          };
          break;
      }

      const { error: insertError } = await supabase
        .from(tableName)
        .insert(insertData);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({});
      setSelectedType('');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || t('Failed to submit application', '???? ???? ?????? ?????'));
    } finally {
      setLoading(false);
    }
  };

  const renderBirthForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Child's Details", "??????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Child's Name (English)", "??????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.child_name_en || ''}
            onChange={(e) => handleInputChange('child_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Child's Name (Marathi)", "??????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.child_name_mr || ''}
            onChange={(e) => handleInputChange('child_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Date of Birth', '???? ?????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Gender', '????')} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">{t('Select Gender', '???? ?????')}</option>
            <option value="male">{t('Male', '?????')}</option>
            <option value="female">{t('Female', '?????')}</option>
            <option value="other">{t('Other', '???')}</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Place of Birth (Hospital/Home Address)', '???? ???? (????????/?? ?????)')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.place_of_birth || ''}
          onChange={(e) => handleInputChange('place_of_birth', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          placeholder={t('Hospital name or home address', '??????????? ??? ????? ???? ?????')}
          required
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Parents' Details", "???????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Father's Name (English)", "??????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.father_name_en || ''}
            onChange={(e) => handleInputChange('father_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Father's Name (Marathi)", "??????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.father_name_mr || ''}
            onChange={(e) => handleInputChange('father_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Mother's Name (English)", "???? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.mother_name_en || ''}
            onChange={(e) => handleInputChange('mother_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Mother's Name (Marathi)", "???? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.mother_name_mr || ''}
            onChange={(e) => handleInputChange('mother_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("Parent's Aadhaar Number (Optional)", "???????? ???? ???? (????????)")}
        </label>
        <input
          type="text"
          value={formData.parent_aadhaar || ''}
          onChange={(e) => handleInputChange('parent_aadhaar', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          placeholder={t('12-digit Aadhaar number', '?? ???? ???? ????')}
          maxLength={12}
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Proof of Birth', '?????? ??????')} <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-2">
            {t('(Hospital Discharge Card / Anganwadi Record)', '(???????? ????????? ????? / ???????? ???????)')}
          </span>
        </label>
        <FileUpload
          label={t('Proof of Birth', '?????? ??????')}
          uploadType="citizen_docs"
          onFileUploaded={(url) => setFormData(prev => ({ ...prev, proof_of_birth_url: url }))}
          isMarathi={language === 'mr'}
          required
        />
        {formData.proof_of_birth_url && (
          <div className="mt-2 flex items-center gap-3">
            <a href={formData.proof_of_birth_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, proof_of_birth_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeathForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("Deceased Details", "?????? ????????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Deceased Name (English)", "?????? ????????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.deceased_name_en || ''}
            onChange={(e) => handleInputChange('deceased_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Deceased Name (Marathi)", "?????? ????????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.deceased_name_mr || ''}
            onChange={(e) => handleInputChange('deceased_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Date of Death', '?????? ?????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_death || ''}
            onChange={(e) => handleInputChange('date_of_death', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Place of Death', '?????? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.place_of_death || ''}
            onChange={(e) => handleInputChange('place_of_death', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            placeholder={t('Hospital, home, etc.', '????????, ?? ?????')}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Age at Death', '?????? ??')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.age_at_death || ''}
            onChange={(e) => handleInputChange('age_at_death', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            min="0"
            max="150"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Cause of Death', '?????? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cause_of_death || ''}
            onChange={(e) => handleInputChange('cause_of_death', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            placeholder={t('Natural, accident, etc.', '????????, ????? ?????')}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("Deceased Aadhaar Number", "??? ????????? ???? ????")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.deceased_aadhaar || ''}
          onChange={(e) => handleInputChange('deceased_aadhaar', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          placeholder={t('12-digit Aadhaar number', '?? ???? ???? ????')}
          maxLength={12}
          required
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Proof of Death', '???????? ??????')} <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-2">
            {t("(Doctor's Certificate/Panchnama)", "(?????????? ??????????/???????)")}
          </span>
        </label>
        <FileUpload
          label={t('Proof of Death', '?????? ??????')}
          uploadType="citizen_docs"
          onFileUploaded={(url) => setFormData(prev => ({ ...prev, proof_of_death_url: url }))}
          isMarathi={language === 'mr'}
          required
        />
        {formData.proof_of_death_url && (
          <div className="mt-2 flex items-center gap-3">
            <a href={formData.proof_of_death_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, proof_of_death_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMarriageForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("Husband Details", "????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Husband's Name (English)", "????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.husband_name_en || ''}
            onChange={(e) => handleInputChange('husband_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Husband's Name (Marathi)", "????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.husband_name_mr || ''}
            onChange={(e) => handleInputChange('husband_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("Husband's Aadhaar Number", "????? ???? ????")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.husband_aadhaar || ''}
          onChange={(e) => handleInputChange('husband_aadhaar', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          maxLength={12}
          required
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Wife Details", "??????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Wife's Name Before Marriage (English)", "??????????? ??????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.wife_name_before_en || ''}
            onChange={(e) => handleInputChange('wife_name_before_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Wife's Name Before Marriage (Marathi)", "??????????? ??????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.wife_name_before_mr || ''}
            onChange={(e) => handleInputChange('wife_name_before_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Wife's Name After Marriage (English)", "????????? ??????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.wife_name_after_en || ''}
            onChange={(e) => handleInputChange('wife_name_after_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Wife's Name After Marriage (Marathi)", "????????? ??????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.wife_name_after_mr || ''}
            onChange={(e) => handleInputChange('wife_name_after_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("Wife's Aadhaar Number", "??????? ???? ????")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.wife_aadhaar || ''}
          onChange={(e) => handleInputChange('wife_aadhaar', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          maxLength={12}
          required
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Marriage Details", "???????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Date of Marriage', '???????? ?????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_marriage || ''}
            onChange={(e) => handleInputChange('date_of_marriage', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Place of Marriage', '???????? ?????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.place_of_marriage || ''}
            onChange={(e) => handleInputChange('place_of_marriage', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Priest Name (Optional)', '?????? ??? (????????)')}
        </label>
        <input
          type="text"
          value={formData.priest_name || ''}
          onChange={(e) => handleInputChange('priest_name', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Joint Photo', '??????? ????')} <span className="text-red-500">*</span>
          </label>
          <FileUpload
            label={t('Joint Photo','??????? ????')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, joint_photo_url: url }))}
            isMarathi={language === 'mr'}
            required
          />
          {formData.joint_photo_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.joint_photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, joint_photo_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Invitation Card', '???? ???????')} <span className="text-red-500">*</span>
          </label>
          <FileUpload
            label={t('Invitation Card','???????? ?????')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, invitation_card_url: url }))}
            isMarathi={language === 'mr'}
            required
          />
          {formData.invitation_card_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.invitation_card_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, invitation_card_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Aadhaar Cards (Both)', '???? ????? (???????)')} <span className="text-red-500">*</span>
          </label>
          <FileUpload
            label={t('Aadhaar Cards (Both)','???? ????? (???????)')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, aadhaar_cards_url: url }))}
            isMarathi={language === 'mr'}
            required
          />
          {formData.aadhaar_cards_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.aadhaar_cards_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, aadhaar_cards_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBPLForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("Family Head Details", "?????? ????????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Family Head Name (English)", "?????? ????????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.head_name_en || ''}
            onChange={(e) => handleInputChange('head_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Family Head Name (Marathi)", "?????? ????????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.head_name_mr || ''}
            onChange={(e) => handleInputChange('head_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('BPL List Number', '??.??.??. ???? ???????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.bpl_list_number || ''}
            onChange={(e) => handleInputChange('bpl_list_number', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            placeholder={t('BPL list number', '??.??.??. ???? ???????')}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Ration Card Number', '???? ????? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.ration_card_number || ''}
            onChange={(e) => handleInputChange('ration_card_number', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Aadhaar Number (Optional)', '???? ???? (????????)')}
        </label>
        <input
          type="text"
          value={formData.aadhaar_number || ''}
          onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          maxLength={12}
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Ration Card Copy', '???? ??????? ????')} <span className="text-red-500">*</span>
        </label>
        <FileUpload
          label={t('Ration Card Copy','???? ??????? ????')}
          uploadType="citizen_docs"
          onFileUploaded={(url) => setFormData(prev => ({ ...prev, ration_card_url: url }))}
          isMarathi={language === 'mr'}
          required
        />
        {formData.ration_card_url && (
          <div className="mt-2 flex items-center gap-3">
            <a href={formData.ration_card_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, ration_card_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPropertyTaxForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("Property Details", "???????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Property Number', '???????? ???????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.property_number || ''}
            onChange={(e) => handleInputChange('property_number', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            placeholder={t('Property survey number', '???????? ????????? ???????')}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Ward Number (Optional)', '?????? ??????? (????????)')}
          </label>
          <input
            type="text"
            value={formData.ward_number || ''}
            onChange={(e) => handleInputChange('ward_number', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Property Owner Name (English)", "???????? ??????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.owner_name_en || ''}
            onChange={(e) => handleInputChange('owner_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Property Owner Name (Marathi)", "???????? ??????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.owner_name_mr || ''}
            onChange={(e) => handleInputChange('owner_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Identity Proof', '?????? ??????')} <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-2">
            {t('(Aadhaar Card / Voter ID)', '(???? ????? / ????? ???????)')}
          </span>
        </label>
        <FileUpload
          label={t('Identity Proof','??? ??????')}
          uploadType="citizen_docs"
          onFileUploaded={(url) => setFormData(prev => ({ ...prev, identity_proof_url: url }))}
          isMarathi={language === 'mr'}
          required
        />
        {formData.identity_proof_url && (
          <div className="mt-2 flex items-center gap-3">
            <a href={formData.identity_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, identity_proof_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDestituteForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("Beneficiary Details", "???????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Beneficiary Name (English)", "?????????? ??? (???????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.beneficiary_name_en || ''}
            onChange={(e) => handleInputChange('beneficiary_name_en', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Beneficiary Name (Marathi)", "?????????? ??? (?????)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.beneficiary_name_mr || ''}
            onChange={(e) => handleInputChange('beneficiary_name_mr', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Date of Birth (Optional)', '???? ????? (????????)')}
          </label>
          <input
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Age (Optional)', '?? (????????)')}
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            min="0"
            max="150"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Aadhaar Number', '???? ????')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.aadhaar_number || ''}
          onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          maxLength={12}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Ration Card Number (Optional)', '???? ????? ???? (????????)')}
          </label>
          <input
            type="text"
            value={formData.ration_card_number || ''}
            onChange={(e) => handleInputChange('ration_card_number', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Occupation (Optional)', '??????? (????????)')}
          </label>
          <input
            type="text"
            value={formData.occupation || ''}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('Annual Income (?)', '??????? ??????? (?)')}
        </label>
        <input
          type="number"
          value={formData.annual_income || ''}
          onChange={(e) => handleInputChange('annual_income', e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
          min="0"
          placeholder={t('Enter annual income in rupees', '??????? ??????? ????? ????? ???????? ???')}
        />
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Applicant Contact Details", "????????? ?????? ?????")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Applicant Name', '????????? ???')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name || ''}
            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Mobile Number', '??? ????')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={t('10 digits', '?? ????')}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("Document Upload", "??????? ?????")}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Age Proof', '????? ??????')} <span className="text-red-500">*</span>
            <span className="text-gray-500 text-xs ml-2">
              {t('(Birth Certificate / School Leaving Certificate)', '(???? ????? / ???? ????????? ?????)')}
            </span>
          </label>
          <FileUpload
            label={t('Age Proof','????? ??????')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, age_proof_url: url }))}
            isMarathi={language === 'mr'}
            required
          />
          {formData.age_proof_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.age_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, age_proof_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Income Certificate', '?????????? ?????')} <span className="text-red-500">*</span>
          </label>
          <FileUpload
            label={t('Income Certificate','??????? ??????????')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, income_certificate_url: url }))}
            isMarathi={language === 'mr'}
            required
          />
          {formData.income_certificate_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.income_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, income_certificate_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('Disability Certificate (if applicable)', '??????? ?????????? (???? ???????)')}
          </label>
          <FileUpload
            label={t('Disability Certificate','??????? ??????????')}
            uploadType="citizen_docs"
            onFileUploaded={(url) => setFormData(prev => ({ ...prev, disability_certificate_url: url }))}
            isMarathi={language === 'mr'}
          />
          {formData.disability_certificate_url && (
            <div className="mt-2 flex items-center gap-3">
              <a href={formData.disability_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{t('View uploaded file','????? ?????? ???? ???')}</a>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, disability_certificate_url: '' }))} className="text-sm text-red-600">{t('Remove','????')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    if (!selectedType) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          {certificateTypes.find(c => c.id === selectedType)?.name}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedType === 'birth' && renderBirthForm()}
          {selectedType === 'death' && renderDeathForm()}
          {selectedType === 'marriage' && renderMarriageForm()}
          {selectedType === 'bpl' && renderBPLForm()}
          {selectedType === 'property-tax' && renderPropertyTaxForm()}
          {selectedType === 'destitute' && renderDestituteForm()}

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => { setSelectedType(''); setFormData({}); }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('Cancel', '???? ???')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">?</span>
                  {t('Submitting...', '???? ??? ???...')}
                </>
              ) : (
                t('Submit Application', '???? ???? ???')
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('Application Submitted Successfully!', '???? ???????????? ???? ????!')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('Your certificate application has been submitted. You will be notified about the status.', 
              '???? ????????????? ???? ???? ???? ???. ????? ??????????? ????? ???? ????.')}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              {t('Apply for Another Certificate', '??????? ??????????????? ???? ???')}
            </button>
            <button
              onClick={onBack}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('Back to Home', '????????????? ??? ??')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('Apply for Certificate', '??????????????? ???? ???')}
            </h2>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ? {t('Back', '????')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Login Required Notice */}
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {t('Login Required', '????? ??????')}
              </h3>
              <p className="text-yellow-700 mb-4">
                {t('Please login to apply for certificates. This helps us track your application and notify you about the status.', 
                  '????? ???????????????? ???? ?????????? ????? ???. ?? ??????? ???? ???? ????? ??????? ??? ??????????? ????? ??????? ??? ????.')}
              </p>
              <button
                onClick={() => onNavigate ? onNavigate('login') : onBack()}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {t('Go to Login', '????? ???')}
              </button>
            </div>
          )}

          {user && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {certificateTypes.map((cert) => (
                  <button
                    key={cert.id}
                    onClick={() => { 
                      setSelectedType(cert.id as CertificateType);
                      setFormData({});
                      // Update URL and history
                      if (onNavigate) {
                        onNavigate('certificate', { type: cert.id });
                      }
                      // Update browser history
                      const newUrl = `/forms/${cert.id}`;
                      window.history.pushState({ certificateType: cert.id }, '', newUrl);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === cert.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{cert.icon}</span>
                    <span className="font-medium">{cert.name}</span>
                  </button>
                ))}
              </div>

              {renderForm()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateFormsPage;