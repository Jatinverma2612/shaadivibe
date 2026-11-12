import React, { useState, useEffect } from 'react';
import {
  fetchCustomers,
  fetchCustomerById,
  updateCustomer,
} from '../../services/api.js';
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Heart,
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Selected Customer for Details Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadCustomers = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');
      const params = { page, limit: 15 };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await fetchCustomers(params);
      setCustomers(res.data?.customers || (Array.isArray(res.data) ? res.data : []));
      if (res.pagination || res.data?.totalPages) setPagination(res.pagination || res.data);
    } catch (err) {
      setError(err.message || 'Failed to load customers from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers(1);
  };

  const handleOpenDetails = async (custId) => {
    try {
      setSelectedCustomerId(custId);
      setIsLoadingDetails(true);
      setIsEditingName(false);
      const res = await fetchCustomerById(custId);
      setCustomerDetails(res.data);
      setEditNameValue(res.data?.name || '');
    } catch (err) {
      alert(`Could not load customer details: ${err.message}`);
      setSelectedCustomerId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return;
    try {
      setIsSavingName(true);
      const res = await updateCustomer(selectedCustomerId, { name: editNameValue.trim() });
      setCustomerDetails((prev) => ({ ...prev, name: res.data?.name }));
      setIsEditingName(false);
      showToast('Customer name updated successfully.');
      loadCustomers(pagination.page);
    } catch (err) {
      alert(`Failed to update customer name: ${err.message}`);
    } finally {
      setIsSavingName(false);
    }
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Customers Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View registered couples, order history, and created wedding invitations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadCustomers(pagination.page)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => loadCustomers(1), 0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#8B1D3B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading customer records from database...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={() => loadCustomers(1)}
            className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No customers found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No registered customers match your search criteria. Try a different search query.'
              : 'No customer accounts exist in the database yet.'}
          </p>
        </div>
      ) : (
        /* Real Customers Table */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Orders</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Invitations</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((cust) => {
                  const custId = cust._id || cust.id;
                  const joinedDate = cust.createdAt
                    ? new Date(cust.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={custId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8B1D3B]/10 text-[#8B1D3B] flex items-center justify-center font-bold text-xs shrink-0">
                          {(cust.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{cust.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{cust.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {cust.ordersCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-[#8B1D3B] border border-rose-200">
                          {cust.invitationsCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{joinedDate}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(custId)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} customers)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => loadCustomers(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadCustomers(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Customer Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">Profile overview, orders, and invitation projects.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetails || !customerDetails ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 text-[#8B1D3B] animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading customer history...</p>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-left">
                {/* Profile Card */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Profile Information
                    </span>
                    {!isEditingName ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1D3B] hover:underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Name</span>
                      </button>
                    ) : null}
                  </div>

                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20"
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={isSavingName}
                        className="px-3 py-1.5 rounded-lg bg-[#8B1D3B] text-white text-xs font-semibold hover:bg-[#6E142C] flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSavingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-gray-900">{customerDetails.name}</div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Email Address</span>
                      <span className="text-gray-800 font-medium">{customerDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Account Role</span>
                      <span className="capitalize text-gray-800 font-medium">{customerDetails.role}</span>
                    </div>
                  </div>
                </div>

                {/* Orders History */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8B1D3B]" />
                    <span>Customer Orders ({customerDetails.orders?.length || 0})</span>
                  </div>

                  {!customerDetails.orders || customerDetails.orders.length === 0 ? (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 text-center">
                      No orders placed by this customer yet.
                    </div>
                  ) : (
                    <div className="border border-gray-200/80 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {customerDetails.orders.map((ord) => (
                        <div key={ord._id} className="p-3 flex items-center justify-between hover:bg-gray-50/60">
                          <div>
                            <span className="font-mono font-semibold text-gray-900 block">{ord.orderNumber}</span>
                            <span className="text-gray-500 text-[11px] block">{ord.packageSnapshot?.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block">
                              ₹{(ord.pricing?.total || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-gray-100 text-gray-700">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invitations Created */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Invitations Created ({customerDetails.invitations?.length || 0})</span>
                  </div>

                  {!customerDetails.invitations || customerDetails.invitations.length === 0 ? (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 text-center">
                      No invitations created by this customer yet.
                    </div>
                  ) : (
                    <div className="border border-gray-200/80 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {customerDetails.invitations.map((inv) => (
                        <div key={inv._id} className="p-3 flex items-center justify-between hover:bg-gray-50/60">
                          <div>
                            <span className="font-semibold text-gray-900 block">
                              {inv.brideName} &amp; {inv.groomName}
                            </span>
                            <span className="text-gray-400 text-[11px] block">Slug: /{inv.slug}</span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                inv.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-300'
                              }`}
                            >
                              {inv.status}
                            </span>
                            {inv.status === 'published' && (
                              <a
                                href={`/invite/${inv.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded text-gray-400 hover:text-gray-700"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
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

