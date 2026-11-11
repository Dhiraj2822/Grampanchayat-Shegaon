/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceType: string; // 'certificate' or 'tax'
  referenceId: string; // Application Number or Property ID
  onSuccess: () => void;
  userEmail?: string;
  userPhone?: string;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  serviceType, 
  referenceId, 
  onSuccess
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'summary' | 'processing' | 'success'>('summary');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setStep('processing');

    try {
      // ============================================================
      // RAZORPAY INTEGRATION GUIDE
      // ============================================================
      // 1. Create an order on your backend (Supabase Edge Function)
      // const { data: order } = await supabase.functions.invoke('create-razorpay-order', { 
      //   body: { amount, currency: 'INR' } 
      // });
      
      // 2. Initialize Razorpay
      // const options = {
      //   key: "YOUR_RAZORPAY_KEY_ID",
      //   amount: amount * 100, // Amount in paise
      //   currency: "INR",
      //   name: "Gram Panchayat Services",
      //   description: `Payment for ${serviceType} - ${referenceId}`,
      //   order_id: order.id,
      //   handler: async function (response: any) {
      //     // 3. Verify payment on backend
      //     await verifyPayment(response);
      //   },
      //   prefill: {
      //     email: userEmail,
      //     contact: userPhone
      //   }
      // };
      // const rzp = new (window as any).Razorpay(options);
      // rzp.open();
      // ============================================================

      // SIMULATED PAYMENT (For Demo/Testing)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Record payment in database
      const { error: dbError } = await supabase
        .from('payments')
        .insert([{
          user_id: (await supabase.auth.getUser()).data.user?.id,
          service_type: serviceType,
          reference_id: referenceId,
          amount: amount,
          status: 'completed',
          payment_method: 'simulated_card',
          transaction_id: `TXN_${Date.now()}`
        }]);

      if (dbError) throw dbError;

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setStep('summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CreditCard size={24} />
            Secure Payment
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'summary' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-500 mb-1">Total Amount Due</p>
                <h2 className="text-4xl font-bold text-gray-800">₹{amount}</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{serviceType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference ID:</span>
                  <span className="font-medium text-gray-900">{referenceId}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                Secured by Razorpay (Simulated Mode)
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h3>
              <p className="text-gray-500">Please do not close this window...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-500">Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
