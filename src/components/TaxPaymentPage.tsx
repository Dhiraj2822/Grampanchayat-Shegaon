import { useState } from 'react';
import { CreditCard, Home, Droplet, CheckCircle } from 'lucide-react';
import { Language } from '../types';

interface TaxPaymentPageProps {
  language: Language;
}

const TaxPaymentPage = ({ language }: TaxPaymentPageProps) => {
  const [taxType, setTaxType] = useState<'property' | 'water'>('property');
  const [formData, setFormData] = useState({
    taxNumber: '',
    ownerName: '',
    mobile: '',
    amount: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment process
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ taxNumber: '', ownerName: '', mobile: '', amount: '' });
    }, 5000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
        <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          {t('Payment Successful!', 'पेमेंट यशस्वी!')}
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          {t('Your tax payment has been received successfully.', 'तुमचे कर पेमेंट यशस्वीरित्या प्राप्त झाले आहे.')}
        </p>
        <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">{t('Receipt Number:', 'पावती क्रमांक:')}</p>
          <p className="text-2xl font-bold text-gray-800">TAX{Date.now().toString().slice(-8)}</p>
        </div>
        <p className="text-sm text-gray-600">
          {t('A confirmation SMS has been sent to your registered mobile number.', 'तुमच्या नोंदणीकृत मोबाइल नंबरवर पुष्टीकरण SMS पाठवला आहे.')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        {t('Pay Tax Online', 'ऑनलाइन कर भरा')}
      </h1>

      {/* Tax Type Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setTaxType('property')}
          className={`p-6 rounded-xl border-2 transition-all ${
            taxType === 'property'
              ? 'border-green-600 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <Home size={48} className={`mx-auto mb-4 ${taxType === 'property' ? 'text-green-600' : 'text-gray-400'}`} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t('Property Tax', 'मालमत्ता कर')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('Annual property tax for residential and commercial properties', 'निवासी आणि व्यावसायिक मालमत्तेसाठी वार्षिक कर')}
          </p>
        </button>

        <button
          onClick={() => setTaxType('water')}
          className={`p-6 rounded-xl border-2 transition-all ${
            taxType === 'water'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <Droplet size={48} className={`mx-auto mb-4 ${taxType === 'water' ? 'text-blue-600' : 'text-gray-400'}`} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t('Water Tax', 'पाणी कर')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('Monthly water supply charges', 'मासिक पाणी पुरवठा शुल्क')}
          </p>
        </button>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {taxType === 'property' 
            ? t('Property Tax Payment', 'मालमत्ता कर भरणे')
            : t('Water Tax Payment', 'पाणी कर भरणे')
          }
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {taxType === 'property' 
                ? t('Property Tax Number', 'मालमत्ता कर क्रमांक')
                : t('Water Connection Number', 'पाणी जोडणी क्रमांक')
              }
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={taxType === 'property' ? 'PT-2024-001' : 'WC-2024-001'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('Owner Name', 'मालकाचे नाव')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Enter owner name', 'मालकाचे नाव टाका')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('Mobile Number', 'मोबाइल नंबर')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('Amount (₹)', 'रक्कम (₹)')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('Enter amount', 'रक्कम टाका')}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{t('Note:', 'टीप:')}</strong> {t('This is a demo payment interface. In production, this will integrate with payment gateway for actual transactions.', 'हा एक डेमो पेमेंट इंटरफेस आहे. प्रोडक्शनमध्ये, हे वास्तविक व्यवहारांसाठी पेमेंट गेटवेशी एकत्रित होईल.')}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            {t('Proceed to Payment', 'पेमेंट करा')}
          </button>
        </form>
      </div>

      {/* Payment Methods */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {t('Accepted Payment Methods', 'स्वीकृत पेमेंट पद्धती')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-700">💳 {t('Debit Card', 'डेबिट कार्ड')}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-700">💳 {t('Credit Card', 'क्रेडिट कार्ड')}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-700">📱 UPI</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-700">🏦 {t('Net Banking', 'नेट बँकिंग')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxPaymentPage;
