import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { getLecturerEarnings, createSampleTransactions, debugTransactions, createWithdrawal } from '../services/firestore';
import WithdrawalModal from '../components/modals/WithdrawalModal';

export default function LecturerEarnings() {
  const { userData, loading: authLoading } = useAuthStore();
  const toast = useToast();
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    paid: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (userData?.uid) {
        loadEarnings();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, userData?.uid]);

  const loadEarnings = async () => {
    if (!userData?.uid) {
      console.warn('loadEarnings called without valid userData.uid');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading earnings for lecturer:', userData.uid);

      // Fetch real earnings data from Firestore
      const earningsData = await getLecturerEarnings(userData.uid);
      console.log('Received earnings data:', earningsData);
      
      setEarnings({
        total: earningsData.total || 0,
        thisMonth: earningsData.thisMonth || 0,
        pending: earningsData.pending || 0,
        paid: earningsData.paid || 0
      });

      // Format transactions for display
      const formattedTransactions = (earningsData.transactions || []).map(transaction => ({
        id: transaction.id,
        courseName: transaction.metadata?.courseName || 'Unknown Course',
        studentName: transaction.metadata?.studentName || 'Unknown Student',
        amount: transaction.amount || 0,
        commission: transaction.lecturerEarning || 0,
        date: transaction.createdAt?.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt),
        status: 'paid',
        reference: transaction.paymentReference
      }));

      console.log('Formatted transactions:', formattedTransactions);
      setTransactions(formattedTransactions);

      // Show success message if there are earnings
      if (earningsData.total > 0) {
        toast.success(`Loaded ${formattedTransactions.length} transactions`);
      } else {
        console.log('No earnings found for this lecturer');
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (earnings.pending < 10000) {
      toast.error('Minimum withdrawal amount is ₦10,000');
      return;
    }
    setShowWithdrawalModal(true);
  };

  const handleWithdrawalSubmit = async (withdrawalData) => {
    try {
      setWithdrawalLoading(true);
      
      const withdrawalRequest = {
        ...withdrawalData,
        lecturerId: userData.uid,
        lecturerName: userData.displayName,
        lecturerEmail: userData.email
      };

      await createWithdrawal(withdrawalRequest);
      
      toast.success('Withdrawal request submitted successfully! You will receive a confirmation email shortly.');
      setShowWithdrawalModal(false);
      
      // Reload earnings to reflect updated balance
      await loadEarnings();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request: ' + error.message);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const handleRefreshData = async () => {
    if (!userData?.uid) {
      toast.warning('Please wait for authentication to complete');
      return;
    }
    await loadEarnings();
  };

  const handleDebugDatabase = async () => {
    try {
      console.log('🔍 DEBUGGING DATABASE - Check console for details');
      const debugInfo = await debugTransactions();
      
      console.log('=== CURRENT USER INFO ===');
      console.log('Current userData:', userData);
      console.log('Current userData.uid:', userData?.uid);
      
      alert(`Found ${debugInfo.allTransactions.length} transactions, ${debugInfo.allEnrollments.length} enrollments, and ${debugInfo.lecturers.length} lecturers. Check console for details.`);
    } catch (error) {
      console.error('Error debugging database:', error);
      alert('Failed to debug database: ' + error.message);
    }
  };

  const handleGenerateSampleData = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true);
      toast.info('Generating sample transaction data...');
      
      await createSampleTransactions(userData.uid);
      toast.success('Sample data created successfully!');
      
      // Reload earnings data
      await loadEarnings();
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast.error('Failed to generate sample data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(t => {
    if (selectedPeriod === 'all') return true;
    if (selectedPeriod === 'pending') return t.status === 'pending';
    if (selectedPeriod === 'paid') return t.status === 'paid';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/lecturer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900">Earnings & Payouts</h1>
              <p className="text-gray-600 mt-2">Track your course sales and manage withdrawals</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDebugDatabase}
                className="btn-outline flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                🔍 Debug Database
              </button>
              <button
                onClick={handleRefreshData}
                disabled={loading || !userData?.uid}
                className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowTrendingUpIcon className="w-5 h-5" />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <BanknotesIcon className="w-8 h-8" />
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">Total</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.total)}</div>
              <div className="text-blue-100 text-sm">Lifetime Earnings</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <ArrowTrendingUpIcon className="w-8 h-8" />
                <span className="text-xs bg-green-500 px-2 py-1 rounded-full">Month</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.thisMonth)}</div>
              <div className="text-green-100 text-sm">This Month</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <CalendarIcon className="w-8 h-8" />
                <span className="text-xs bg-yellow-500 px-2 py-1 rounded-full">Pending</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.pending)}</div>
              <div className="text-yellow-100 text-sm">Available to Withdraw</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <CreditCardIcon className="w-8 h-8" />
                <span className="text-xs bg-purple-500 px-2 py-1 rounded-full">Paid</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(earnings.paid)}</div>
              <div className="text-purple-100 text-sm">Already Paid Out</div>
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Request Withdrawal</h2>
                <p className="text-gray-600">
                  Available balance: <span className="font-bold text-green-600">{formatCurrency(earnings.pending)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: ₦10,000</p>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={earnings.pending < 10000}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPeriod('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedPeriod('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === 'pending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSelectedPeriod('paid')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === 'paid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Sale Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Your Commission</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">{formatDate(transaction.date)}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{transaction.courseName}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{transaction.studentName}</td>
                        <td className="px-4 py-4 text-sm text-right text-gray-900">{formatCurrency(transaction.amount)}</td>
                        <td className="px-4 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(transaction.commission)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600 mb-6">Start creating courses to earn money!</p>
                {earnings.total === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      For testing purposes, you can generate sample transaction data
                    </p>
                    <button
                      onClick={handleGenerateSampleData}
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Sample Data'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 card bg-blue-50">
          <div className="card-body">
            <h3 className="font-bold text-gray-900 mb-3">Payment Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• You earn 75% commission on every course sale</li>
              <li>• Minimum withdrawal amount is ₦10,000</li>
              <li>• Withdrawals are processed within 3-5 business days</li>
              <li>• Payments are made via bank transfer to your registered account</li>
              <li>• Update your bank details in your profile settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={earnings.pending}
        onSubmit={handleWithdrawalSubmit}
        loading={withdrawalLoading}
      />
    </div>
  );
}
