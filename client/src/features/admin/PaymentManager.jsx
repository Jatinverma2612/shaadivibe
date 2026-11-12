import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Sliders,
  FileText,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Printer,
  Sparkles,
  ShieldCheck,
  Check,
  Building2,
  Smartphone,
  Banknote,
} from 'lucide-react';
import {
  fetchAdminPayments,
  recordManualPayment,
  refundPayment,
  fetchPaymentConfig,
  updatePaymentConfig,
  fetchOrders,
} from '../../services/api.js';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'captured', label: 'Captured (Paid)' },
  { id: 'pending', label: 'Pending' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'failed', label: 'Failed' },
];

const METHOD_OPTIONS = [
  { id: 'all', label: 'All Methods' },
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'bank_transfer', label: 'Bank Transfer (IMPS / NEFT)' },
  { id: 'cash', label: 'Cash / Offline' },
];

export default function PaymentManager() {
  const [payments, setPayments] = useState([]);
  const [kpis, setKpis] = useState({
    grossVolume: 0,
    capturedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    refundedAmount: 0,
    refundedCount: 0,
    netSettlement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [activePayment, setActivePayment] = useState(null);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [manualForm, setManualForm] = useState({
    orderId: '',
    amount: '',
    method: 'bank_transfer',
    referenceId: '',
    notes: '',
  });

  const [refundForm, setRefundForm] = useState({
    reason: 'Customer requested cancellation',
    amount: '',
  });

  const [gatewayConfig, setGatewayConfig] = useState({
    mode: 'test',
    razorpayEnabled: true,
    razorpayKeyId: '',
    upiEnabled: true,
    upiVpa: '',
    gstNumber: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminPayments({
        search,
        status: selectedStatus,
        method: selectedMethod,
        page,
        limit: 20,
      });

      if (res?.data) {
        setPayments(res.data.payments || []);
        setKpis(res.data.kpis || {});
        setPagination(res.data.pagination || { totalPages: 1, totalCount: 0 });
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      setError(err.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search, selectedStatus, selectedMethod, page]);

  // Load gateway config once
  useEffect(() => {
    fetchPaymentConfig()
      .then((res) => {
        if (res?.data) setGatewayConfig(res.data);
      })
      .catch((err) => console.warn('Config fetch warning:', err));
  }, []);

  // Fetch eligible orders when manual modal opens
  const openManualModal = async () => {
    try {
      setIsManualModalOpen(true);
      setFeedback(null);
      const res = await fetchOrders({ limit: 50 });
      const ordersList = res?.data || res?.orders || [];
      // Prefer pending or unpaid orders
      const filtered = ordersList.filter(
        (o) => o.paymentStatus !== 'paid' || o.status === 'pending' || o.status === 'draft'
      );
      setEligibleOrders(filtered.length ? filtered : ordersList);
      if (filtered.length) {
        setManualForm((prev) => ({
          ...prev,
          orderId: filtered[0]._id,
          amount: filtered[0].pricing?.total || '',
        }));
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    }
  };

  const handleOrderSelect = (e) => {
    const selectedId = e.target.value;
    const selected = eligibleOrders.find((o) => o._id === selectedId);
    setManualForm({
      ...manualForm,
      orderId: selectedId,
      amount: selected?.pricing?.total || '',
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.orderId) return;

    try {
      setActionLoading(true);
      setFeedback(null);
      await recordManualPayment(manualForm);
      setIsManualModalOpen(false);
      setManualForm({
        orderId: '',
        amount: '',
        method: 'bank_transfer',
        referenceId: '',
        notes: '',
      });
      loadPayments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record manual payment.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openRefundModal = (payment) => {
    setActivePayment(payment);
    setRefundForm({
      reason: 'Customer requested cancellation',
      amount: payment.amount,
    });
    setFeedback(null);
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!activePayment) return;

    try {
      setActionLoading(true);
      setFeedback(null);
      await refundPayment(activePayment._id, refundForm);
      setIsRefundModalOpen(false);
      loadPayments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to process refund.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openReceiptModal = (payment) => {
    setActivePayment(payment);
    setIsReceiptModalOpen(true);
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updatePaymentConfig(gatewayConfig);
      setIsConfigModalOpen(false);
    } catch (err) {
      console.error('Config update error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      let csv = '\uFEFF';
      csv += 'SHAADIVIBE TRANSACTIONS LEDGER\n';
      csv += `Generated On,${new Date().toISOString()}\n\n`;

      csv += 'Transaction ID,Order Number,Customer Name,Customer Email,Method,Gateway,Amount (INR),Status,Date\n';
      payments.forEach((p) => {
        csv += `"${p.transactionId}","${p.orderNumber}","${p.customerSnapshot?.name || ''}","${
          p.customerSnapshot?.email || ''
        }","${p.method}","${p.gateway}",${p.amount},"${p.status}","${new Date(
          p.createdAt
        ).toISOString()}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shaadivibe-transactions-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'upi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Smartphone className="w-3 h-3" /> UPI
          </span>
        );
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3 h-3" /> Bank Transfer
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Banknote className="w-3 h-3" /> Cash
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">
            {method}
          </span>
        );
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'captured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Captured
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" /> Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* ========================================================
          1. HEADER & ACTION BUTTONS
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Payments & Financial Ledger
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Gateway Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time transaction settlements, online gateway clearance, manual receipts, and tax invoices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
          {/* Record Manual Payment */}
          <button
            type="button"
            onClick={openManualModal}
            className="px-3.5 py-2 rounded-xl bg-[#8B1D3B] hover:bg-[#6E142C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          {/* Gateway Settings */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-500" />
            <span>Gateways</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Export Transactions to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8B1D3B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. FINANCIAL EXECUTIVE KPIS
         ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Gross Processed Volume */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between group hover:border-[#8B1D3B]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Gross Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              ₹{kpis.grossVolume.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>{kpis.capturedCount} paid transactions</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Successful Payments */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Successful
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              {kpis.capturedCount}
            </div>
            <div className="mt-2 text-[11px] text-gray-400">Captured and verified</div>
          </div>
        </div>

        {/* KPI 3: Pending Clearance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              ₹{kpis.pendingAmount.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-amber-600">
              {kpis.pendingCount} awaiting clearance
            </div>
          </div>
        </div>

        {/* KPI 4: Total Refunds */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Refunded
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              ₹{kpis.refundedAmount.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[11px] text-purple-600 font-semibold">
              {kpis.refundedCount} transactions
            </div>
          </div>
        </div>

        {/* KPI 5: Net Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Net Settlement
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D3B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#8B1D3B] tracking-tight leading-none">
              ₹{kpis.netSettlement.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[11px] text-gray-400">Post-refund balance</div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH & FILTERS BAR
         ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Transaction ID, Order #, Customer Name, Email, or UPI Ref..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
            />
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#8B1D3B] text-white shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. TRANSACTIONS LEDGER TABLE
         ======================================================== */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Transaction Records
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {payments.length} transactions across active orders.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1D3B]" />
            <span>Loading payment records...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <span className="font-semibold text-gray-700 block">No transactions found</span>
            <span className="text-[11px] text-gray-400">
              Try adjusting your search criteria or record a manual transaction.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider bg-gray-50/50">
                  <th className="py-3 px-5">Transaction ID</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => {
                  const dateStr = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                        {p.transactionId}
                      </td>

                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-semibold text-[#8B1D3B]">
                        {p.orderNumber}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          {p.customerSnapshot?.name || 'Walk-in Client'}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {p.customerSnapshot?.email || p.customerSnapshot?.phone || '—'}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">{getMethodBadge(p.method)}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-gray-900">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">{getStatusPill(p.status)}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-gray-500 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tax Receipt Button */}
                          <button
                            type="button"
                            onClick={() => openReceiptModal(p)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            title="View GST Tax Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Refund Button */}
                          {p.status === 'captured' && (
                            <button
                              type="button"
                              onClick={() => openRefundModal(p)}
                              className="p-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                              title="Process Refund"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: RECORD MANUAL OFFLINE PAYMENT
         ======================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Record Manual Payment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm an offline bank transfer, cheque, or direct UPI transaction.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Select Order */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Target Order *
                </label>
                <select
                  value={manualForm.orderId}
                  onChange={handleOrderSelect}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                >
                  {eligibleOrders.length === 0 ? (
                    <option value="">No pending orders available</option>
                  ) : (
                    eligibleOrders.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.orderNumber} — {o.customerSnapshot?.name} (₹{o.pricing?.total})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Amount & Method Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    required
                    min="1"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    value={manualForm.method}
                    onChange={(e) => setManualForm({ ...manualForm, method: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                  >
                    <option value="bank_transfer">Bank Transfer (IMPS / NEFT)</option>
                    <option value="upi">Direct UPI QR Scan</option>
                    <option value="cash">Cash / In-person</option>
                    <option value="card">Point of Sale / Card Machine</option>
                  </select>
                </div>
              </div>

              {/* Transaction Reference ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Bank Reference / UTR / Receipt ID
                </label>
                <input
                  type="text"
                  value={manualForm.referenceId}
                  onChange={(e) => setManualForm({ ...manualForm, referenceId: e.target.value })}
                  placeholder="e.g. UTR-98214981729 or CHQ-00219"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Auditor Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. Verified with ICICI Current Account statement."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !manualForm.orderId}
                  className="px-5 py-2 rounded-xl bg-[#8B1D3B] hover:bg-[#6E142C] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirm & Mark Paid</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: PROCESS REFUND
         ======================================================== */}
      {isRefundModalOpen && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Process Refund
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Transaction: <span className="font-mono font-bold">{activePayment.transactionId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <span className="font-bold block">Important Notice:</span>
                Refunding this transaction will update Order{' '}
                <span className="font-bold">{activePayment.orderNumber}</span> to Refunded status and
                record the audit trail.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  max={activePayment.amount}
                  min="1"
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Reason for Refund *
                </label>
                <textarea
                  rows="3"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  required
                  placeholder="e.g. Couple requested cancellation due to wedding date postponement."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Confirm Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: GST TAX INVOICE RECEIPT
         ======================================================== */}
      {isReceiptModalOpen && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-left space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Royal Emblem */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="font-serif text-xl font-black text-[#8B1D3B] tracking-wider block">
                  SHAADIVIBE
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-0.5">
                  Royal Digital Wedding Invitations
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  GSTIN: {gatewayConfig.gstNumber || '07AAAAA0000A1Z5'}
                </span>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider mb-1">
                  Tax Invoice
                </span>
                <div className="text-xs font-mono font-bold text-gray-700">
                  {activePayment.orderNumber}
                </div>
              </div>
            </div>

            {/* Billed To & Transaction Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <span className="font-bold text-gray-900 block">
                  {activePayment.customerSnapshot?.name}
                </span>
                <span className="text-gray-500 block text-[11px]">
                  {activePayment.customerSnapshot?.email}
                </span>
                <span className="text-gray-500 block text-[11px]">
                  {activePayment.customerSnapshot?.phone}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Payment Details
                </span>
                <span className="font-mono text-[11px] text-gray-700 block">
                  {activePayment.transactionId}
                </span>
                <span className="text-gray-500 block text-[11px] capitalize">
                  Method: {activePayment.method}
                </span>
                <span className="text-gray-500 block text-[11px]">
                  Date: {new Date(activePayment.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      Wedding Invitation Suite License ({activePayment.orderNumber})
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      ₹{Math.round(activePayment.amount / 1.18).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500 text-[11px]">
                      Goods & Services Tax (18% GST Included)
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 text-[11px]">
                      ₹{(activePayment.amount - Math.round(activePayment.amount / 1.18)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-gray-50/70 font-bold">
                    <td className="py-3 px-3 text-gray-900">Total Paid (INR)</td>
                    <td className="py-3 px-3 text-right text-[#8B1D3B] text-sm">
                      ₹{activePayment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Digital Verification Stamp */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Verified & Settled Successfully</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: GATEWAY CONFIGURATION
         ======================================================== */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Payment Gateway Settings
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure Indian & Diaspora payment processing channels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} className="space-y-4">
              {/* Environment Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Operating Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGatewayConfig({ ...gatewayConfig, mode: 'test' })}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      gatewayConfig.mode === 'test'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Test / Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayConfig({ ...gatewayConfig, mode: 'live' })}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      gatewayConfig.mode === 'live'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Live Production
                  </button>
                </div>
              </div>

              {/* Razorpay Key ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={gatewayConfig.razorpayKeyId}
                  onChange={(e) =>
                    setGatewayConfig({ ...gatewayConfig, razorpayKeyId: e.target.value })
                  }
                  placeholder="rzp_test_... or rzp_live_..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              {/* UPI Merchant VPA */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  UPI Merchant VPA / ID
                </label>
                <input
                  type="text"
                  value={gatewayConfig.upiVpa}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, upiVpa: e.target.value })}
                  placeholder="e.g. shaadivibe@icici"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  GST Registration Number
                </label>
                <input
                  type="text"
                  value={gatewayConfig.gstNumber}
                  onChange={(e) =>
                    setGatewayConfig({ ...gatewayConfig, gstNumber: e.target.value })
                  }
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#8B1D3B] hover:bg-[#6E142C] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

