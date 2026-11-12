
import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchCustomersLookup,
  
  fetchThemes,
} from '../../services/api.js';
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  Layers,
  FileText,
  Trash2,
  Check,
  Calendar,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const OrderManager = ({ onOrdersUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    draft: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Selected Order for Details View Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Wizard / Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Wizard Data Sources
  const [customersList, setCustomersList] = useState([]);
  const [themesList, setThemesList] = useState([]);
  const [isLoadingWizardData, setIsLoadingWizardData] = useState(false);

  // Wizard Form State
  const [wizardForm, setWizardForm] = useState({
    customerId: '',
    selectedCustomer: null,
    themeId: '',
    selectedTheme: null,
    notes: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await fetchOrders(params);
      setOrders(res.data || []);
      if (res.stats) setStats(res.stats);
      if (onOrdersUpdate) onOrdersUpdate();
    } catch (err) {
      setError(err.message || 'Failed to fetch orders from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDetails = async (orderId) => {
    try {
      setIsDetailsLoading(true);
      const data = await fetchOrderById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      alert(`Could not load order details: ${err.message}`);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleStatusTransition = async (orderId, targetStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updateOrderStatus(orderId, targetStatus);
      showToast(`Order status updated to "${targetStatus}".`);
      loadOrders();
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
        const refreshed = await fetchOrderById(orderId);
        setSelectedOrder(refreshed);
      }
    } catch (err) {
      alert(`Status transition failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteDraft = async (order) => {
    if (!window.confirm(`Are you sure you want to permanently delete draft order ${order.orderNumber}?`)) {
      return;
    }
    try {
      await deleteOrder(order._id || order.id);
      showToast(`Draft order ${order.orderNumber} deleted.`);
      loadOrders();
      if (selectedOrder?._id === order._id) setSelectedOrder(null);
    } catch (err) {
      alert(`Could not delete order: ${err.message}`);
    }
  };

  // Open Create Wizard
  const handleOpenCreateWizard = async () => {
    setWizardStep(1);
    setWizardError('');
    setWizardForm({
      customerId: '',
      selectedCustomer: null,
      themeId: '',
      selectedTheme: null,
      notes: '',
    });
    setIsCreateModalOpen(true);

    try {
      setIsLoadingWizardData(true);
      const [customers, themes] = await Promise.all([
        fetchCustomersLookup().catch(() => []),
        fetchThemes().catch(() => []),
      ]);
      setCustomersList(customers || []);
      setThemesList(themes || []);
    } catch (err) {
      setWizardError('Failed to load eligible customers or themes.');
    } finally {
      setIsLoadingWizardData(false);
    }
  };

  // Submit Order from Wizard
  const handleWizardSubmit = async (targetStatus = 'draft') => {
    if (!wizardForm.customerId) {
      setWizardError('Please select a customer for this order.');
      setWizardStep(1);
      return;
    }
    if (!wizardForm.themeId) {
      setWizardError('Please select a wedding theme package.');
      setWizardStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      setWizardError('');
      const payload = {
        customerId: wizardForm.customerId,
        themeId: wizardForm.themeId,
        notes: wizardForm.notes,
        status: targetStatus,
        source: 'admin_manual',
      };

      const result = await createOrder(payload);
      showToast(`Order ${result.data?.orderNumber} created successfully as ${targetStatus}!`);
      setIsCreateModalOpen(false);
      loadOrders();
    } catch (err) {
      setWizardError(err.message || 'Failed to create order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers for Status Badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Check className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>Processing</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            <span>Draft</span>
          </span>
        );
    }
  };

  const getPackageBadge = (packageType = '') => {
    const lower = packageType.toLowerCase();
    if (lower.includes('video') && lower.includes('website')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (lower.includes('video')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#1E040D] text-white text-xs font-semibold shadow-xl border border-rose-900/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View, create, and manage customer wedding invitation orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateWizard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Top Status Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: `All Orders (${stats.all})` },
          { id: 'pending', label: `Pending (${stats.pending})` },
          { id: 'confirmed', label: `Confirmed (${stats.confirmed})` },
          { id: 'processing', label: `Processing (${stats.processing})` },
          { id: 'completed', label: `Completed (${stats.completed})` },
          { id: 'cancelled', label: `Cancelled (${stats.cancelled})` },
          { id: 'draft', label: `Drafts (${stats.draft})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#8B1D3B] text-[#8B1D3B]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer, package..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(loadOrders, 0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#8B1D3B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading real order records from database...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={loadOrders}
            className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No orders found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No orders match your search keyword. Clear the search to view all orders.'
              : activeTab !== 'all'
              ? `There are currently no orders in "${activeTab}" status.`
              : 'Create your first customer order using the multi-step order wizard.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Order</span>
          </button>
        </div>
      ) : (
        /* Real Orders Table matching screenshot layout */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4 font-semibold"># Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Package / Theme</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created At</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const orderId = order._id || order.id;
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr key={orderId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 font-mono">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {order.customerSnapshot?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {order.customerSnapshot?.email || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getPackageBadge(
                            order.packageSnapshot?.packageType
                          )}`}
                        >
                          {order.packageSnapshot?.name || 'Theme Package'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ₹{order.pricing?.total?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4 text-gray-500">{dateStr}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(orderId)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
                          >
                            View
                          </button>

                          {order.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(order)}
                              title="Delete Draft"
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ========================================================
          MULTI-STEP ORDER CREATION MODAL WIZARD
         ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Create New Order</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Step {wizardStep} of 4: {
                    wizardStep === 1 ? 'Select Customer' :
                    wizardStep === 2 ? 'Select Theme Package' :
                    wizardStep === 3 ? 'Order Notes & Settings' :
                    'Review & Confirmation'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-4 border-b border-gray-100 text-center text-xs font-semibold">
              {[
                { step: 1, label: '1. Customer' },
                { step: 2, label: '2. Theme' },
                { step: 3, label: '3. Details' },
                { step: 4, label: '4. Review' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`py-2.5 transition-colors border-b-2 ${
                    wizardStep === s.step
                      ? 'border-[#8B1D3B] text-[#8B1D3B] bg-rose-50/30'
                      : wizardStep > s.step
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50/20'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Error Banner */}
            {wizardError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isLoadingWizardData ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B1D3B] mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Loading customers and theme packages...</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Customer Selection */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Select Registered Customer <span className="text-rose-600">*</span>
                        </label>
                        <p className="text-xs text-gray-500">
                          Choose an existing customer account from the database.
                        </p>
                      </div>

                      {customersList.length === 0 ? (
                        <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            No registered customer accounts found.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {customersList.map((cust) => {
                            const isSelected = wizardForm.customerId === cust._id;
                            return (
                              <div
                                key={cust._id}
                                onClick={() =>
                                  setWizardForm((prev) => ({
                                    ...prev,
                                    customerId: cust._id,
                                    selectedCustomer: cust,
                                  }))
                                }
                                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'border-[#8B1D3B] bg-rose-50/40 shadow-xs'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-xs text-gray-900">
                                    {cust.name}
                                  </div>
                                  <div className="text-[11px] text-gray-500">{cust.email}</div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-[#8B1D3B] shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Theme / Package Selection */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Select Wedding Theme / Package <span className="text-rose-600">*</span>
                        </label>
                        <p className="text-xs text-gray-500">
                          Pricing is derived authoritatively from the live theme document.
                        </p>
                      </div>

                      {themesList.length === 0 ? (
                        <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500">No active themes available.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                          {themesList.map((theme) => {
                            const isSelected = wizardForm.themeId === (theme._id || theme.id);
                            const price =
                              theme.offerPrice > 0 && theme.offerPrice < theme.priceDisplay
                                ? theme.offerPrice
                                : theme.priceDisplay;

                            return (
                              <div
                                key={theme._id || theme.id}
                                onClick={() =>
                                  setWizardForm((prev) => ({
                                    ...prev,
                                    themeId: theme._id || theme.id,
                                    selectedTheme: theme,
                                  }))
                                }
                                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-[#8B1D3B] bg-rose-50/40 shadow-xs ring-1 ring-[#8B1D3B]'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-xs text-gray-900 truncate">
                                      {theme.name}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle2 className="w-4 h-4 text-[#8B1D3B] shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    Category: {theme.category || 'Royal'}
                                  </div>
                                </div>
                                <div className="pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
                                  <span className="text-[11px] font-medium text-gray-600">
                                    {theme.themeType === 'video' ? 'Video Only' : theme.themeType === 'website' ? 'Interactive Web' : 'Complete Suite'}
                                  </span>
                                  <span className="font-bold text-xs text-[#8B1D3B]">
                                    ₹{price}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Order Details */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selected Customer:</span>
                          <span className="font-semibold text-gray-900">
                            {wizardForm.selectedCustomer?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Selected Theme:</span>
                          <span className="font-semibold text-gray-900">
                            {wizardForm.selectedTheme?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                          <span>Calculated Total:</span>
                          <span className="text-[#8B1D3B]">
                            ₹{wizardForm.selectedTheme?.offerPrice > 0 ? wizardForm.selectedTheme.offerPrice : wizardForm.selectedTheme?.priceDisplay || 0}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Internal Notes & Instructions (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={wizardForm.notes}
                          onChange={(e) =>
                            setWizardForm((prev) => ({ ...prev, notes: e.target.value }))
                          }
                          placeholder="e.g. VIP couple order, expedited 1080p rendering requested..."
                          className="w-full p-3 rounded-xl text-xs bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review & Place Order */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#8B1D3B]/5 to-rose-50 border border-[#8B1D3B]/20 space-y-3 text-xs">
                        <h4 className="font-bold text-sm text-[#8B1D3B] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Order Summary Review</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200/50">
                          <div>
                            <span className="text-gray-500 text-[11px] block">Customer</span>
                            <span className="font-semibold text-gray-900">
                              {wizardForm.selectedCustomer?.name}
                            </span>
                            <span className="text-gray-400 text-[10px] block">
                              {wizardForm.selectedCustomer?.email}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500 text-[11px] block">Package / Theme</span>
                            <span className="font-semibold text-gray-900">
                              {wizardForm.selectedTheme?.name}
                            </span>
                            <span className="text-gray-400 text-[10px] block">
                              {wizardForm.selectedTheme?.themeType || 'Website'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-rose-200/50 flex items-center justify-between text-sm font-bold text-gray-900">
                          <span>Total Amount to Charge:</span>
                          <span className="text-[#8B1D3B] text-base">
                            ₹{wizardForm.selectedTheme?.offerPrice > 0 ? wizardForm.selectedTheme.offerPrice : wizardForm.selectedTheme?.priceDisplay || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => prev - 1)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    setWizardError('');
                    if (wizardStep === 1 && !wizardForm.customerId) {
                      setWizardError('Please select a customer.');
                      return;
                    }
                    if (wizardStep === 2 && !wizardForm.themeId) {
                      setWizardError('Please select a theme.');
                      return;
                    }
                    setWizardStep((prev) => prev + 1);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] flex items-center gap-1 shadow-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWizardSubmit('draft')}
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWizardSubmit('confirmed')}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ORDER DETAILS DRAWER / MODAL
         ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Customer Snapshot */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Customer Information (Snapshot)
                </span>
                <div className="text-sm font-bold text-gray-900">
                  {selectedOrder.customerSnapshot?.name}
                </div>
                <div className="text-gray-600">{selectedOrder.customerSnapshot?.email}</div>
                {selectedOrder.customerSnapshot?.phone && (
                  <div className="text-gray-500">{selectedOrder.customerSnapshot.phone}</div>
                )}
              </div>

              {/* Package Snapshot */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Purchased Theme / Package (Historical Snapshot)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {selectedOrder.packageSnapshot?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedOrder.packageSnapshot?.packageType || 'Wedding Suite'}
                  </span>
                </div>
                <div className="text-gray-500 font-mono text-[11px]">
                  Slug: {selectedOrder.packageSnapshot?.slug}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Pricing Breakdown
                </span>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.pricing?.subtotal?.toLocaleString('en-IN') || 0}</span>
                </div>
                {selectedOrder.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-[#8B1D3B]">
                    ₹{selectedOrder.pricing?.total?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                    Order Notes
                  </span>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Lifecycle Actions */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Update Lifecycle Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'draft' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusTransition(selectedOrder._id, 'pending')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-semibold hover:bg-amber-100 transition-colors"
                      >
                        Mark as Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusTransition(selectedOrder._id, 'confirmed')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-300 font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Confirm Order
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusTransition(selectedOrder._id, 'confirmed')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-300 font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Confirm Order
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusTransition(selectedOrder._id, 'processing')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-300 font-semibold hover:bg-cyan-100 transition-colors"
                      >
                        Start Processing
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleStatusTransition(selectedOrder._id, 'processing')}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-300 font-semibold hover:bg-cyan-100 transition-colors"
                    >
                      Start Processing
                    </button>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <button
                      type="button"
                      onClick={() => handleStatusTransition(selectedOrder._id, 'completed')}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleStatusTransition(selectedOrder._id, 'cancelled')}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 font-semibold hover:bg-rose-100 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

