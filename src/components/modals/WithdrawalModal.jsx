import { useState } from 'react';
import { 
  XMarkIcon, 
  BanknotesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '050', name: 'Ecobank Nigeria Plc' },
  { code: '011', name: 'First Bank of Nigeria Limited' },
  { code: '214', name: 'First City Monument Bank Limited' },
  { code: '070', name: 'Fidelity Bank Plc' },
  { code: '058', name: 'Guaranty Trust Bank Plc' },
  { code: '030', name: 'Heritage Banking Company Ltd' },
  { code: '082', name: 'Keystone Bank Limited' },
  { code: '076', name: 'Polaris Bank Limited' },
  { code: '221', name: 'Stanbic IBTC Bank Plc' },
  { code: '068', name: 'Standard Chartered Bank Nigeria Limited' },
  { code: '232', name: 'Sterling Bank Plc' },
  { code: '033', name: 'United Bank For Africa Plc' },
  { code: '032', name: 'Union Bank of Nigeria Plc' },
  { code: '035', name: 'Wema Bank Plc' },
  { code: '057', name: 'Zenith Bank Plc' },
  { code: '215', name: 'Unity Bank Plc' },
  { code: '101', name: 'Providus Bank' },
  { code: '100', name: 'Suntrust Bank Nigeria Limited' },
  { code: '090', name: 'Jaiz Bank Plc' },
  { code: '301', name: 'Jaiz Bank Plc' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '999', name: 'NIP Virtual Bank' }
];

export default function WithdrawalModal({ 
  isOpen, 
  onClose, 
  availableBalance, 
  onSubmit,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    bankCode: '',
    reason: '',
    phoneNumber: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBankSelect = (e) => {
    const selectedBank = NIGERIAN_BANKS.find(bank => bank.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      bankName: e.target.value,
      bankCode: selectedBank ? selectedBank.code : ''
    }));
    
    if (errors.bankName) {
      setErrors(prev => ({ ...prev, bankName: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (amount < 10000) {
      newErrors.amount = 'Minimum withdrawal amount is ₦10,000';
    } else if (amount > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    }

    // Bank details validation
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }
    if (!formData.accountName) newErrors.accountName = 'Account name is required';
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    const withdrawalData = {
      ...formData,
      amount: parseFloat(formData.amount),
      requestedAt: new Date(),
      status: 'pending'
    };
    onSubmit(withdrawalData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      bankCode: '',
      reason: '',
      phoneNumber: '',
      email: ''
    });
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Withdraw Funds' : 'Confirm Withdrawal'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Form
            <div className="space-y-6">
              {/* Available Balance Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Available Balance</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(availableBalance)}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Minimum withdrawal: ₦10,000
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                    min="10000"
                    max={availableBalance}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleBankSelect}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.bankName ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your bank</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankName && (
                  <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>
                )}
              </div>

              {/* Account Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234567890"
                    maxLength="10"
                  />
                  {errors.accountNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.accountName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Full name as on bank account"
                  />
                  {errors.accountName && (
                    <p className="text-red-600 text-sm mt-1">{errors.accountName}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+234 or 0801234567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Reason (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Withdrawal (Optional)
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Course material expenses, equipment purchase, etc."
                />
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">Important Information:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Withdrawals are processed within 3-5 business days</li>
                      <li>Ensure your bank details are correct to avoid delays</li>
                      <li>A processing fee of ₦100 will be deducted</li>
                      <li>You will receive SMS and email confirmations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Confirmation
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Withdrawal Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-semibold">₦100</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Net Amount:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(parseFloat(formData.amount) - 100)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Bank:</span> {formData.bankName}</div>
                    <div><span className="text-gray-600">Account Number:</span> {formData.accountNumber}</div>
                    <div><span className="text-gray-600">Account Name:</span> {formData.accountName}</div>
                    <div><span className="text-gray-600">Phone:</span> {formData.phoneNumber}</div>
                    <div><span className="text-gray-600">Email:</span> {formData.email}</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p>Please review all details carefully. Once submitted, this withdrawal request cannot be cancelled.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {step === 1 ? 'Step 1 of 2: Enter Details' : 'Step 2 of 2: Confirm Withdrawal'}
          </div>
          
          <div className="flex gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            {step === 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Withdrawal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
