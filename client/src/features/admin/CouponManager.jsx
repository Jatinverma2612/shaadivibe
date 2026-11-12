import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../../services/api.js';
import { Button } from '../../components/common/Button.jsx';
import {
  Tag,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  IndianRupee,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Calendar,
  Layers,
  X
} from 'lucide-react';

export const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ totalActive: 0, totalExpired: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form State
  const initialForm = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCoupons({
        page,
        limit: 15,
        search,
        status: statusFilter,
      });
      if (res.success) {
        setCoupons(res.data.coupons || []);
        setTotalCount(res.data.total || 0);
        setStats(res.data.stats || { totalActive: 0, totalExpired: 0 });
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setError(err.message || 'Unable to load coupon catalog');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive !== false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setModalError(null);
  };

  const handleToggle = async (id) => {
    try {
      await toggleCouponStatus(id);
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Failed to toggle coupon status');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) {
      return;
    }
    try {
      await deleteCoupon(coupon._id);
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : new Date(),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
      } else {
        await createCoupon(payload);
      }

      handleCloseModal();
      loadCoupons();
    } catch (err) {
      setModalError(err.message || 'Failed to save coupon');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-900 tracking-tight flex items-center gap-2">
            <Tag className="w-7 h-7 text-royal-gold-600" />
            Coupons & Offers
          </h1>
          <p className="text-sm text-royal-brown-600 mt-1">
            Create promotional discount codes, manage usage limits, and monitor customer redemptions.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          className="shadow-royal-md flex items-center gap-2 text-xs uppercase tracking-wider font-semibold"
        >
          <Plus className="w-4 h-4 text-royal-gold-300" />
          Create New Coupon
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-royal-gold-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-royal-brown-500 font-medium">Total Coupons</p>
            <p className="text-2xl font-serif font-bold text-royal-maroon-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-royal-gold-50 border border-royal-gold-200 flex items-center justify-center text-royal-gold-700">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-royal-gold-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-600 font-medium">Active & Redeemable</p>
            <p className="text-2xl font-serif font-bold text-emerald-800 mt-1">{stats.totalActive}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-royal-gold-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-600 font-medium">Expired / Past Limit</p>
            <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{stats.totalExpired}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-royal-gold-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-royal-brown-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Coupons' },
            { id: 'active', label: 'Active Only' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-royal-maroon-800 text-royal-gold-200 shadow-sm font-semibold'
                  : 'bg-royal-gold-50/60 text-royal-brown-700 hover:bg-royal-gold-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-royal-gold-200/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-royal-gold-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-royal-brown-600">Loading coupons catalog...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-12 h-12 text-royal-gold-400 mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-royal-maroon-900 mb-1">No Coupons Found</h3>
            <p className="text-sm text-royal-brown-500 max-w-sm mx-auto mb-4">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first promotional discount coupon.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
                <Plus className="w-4 h-4 mr-1 text-royal-gold-300" /> Create Coupon
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-royal-brown-800">
              <thead className="bg-royal-gold-50/60 border-b border-royal-gold-200/70 text-xs uppercase tracking-wider text-royal-maroon-900 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Order</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold-100">
                {coupons.map((coupon) => {
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                  const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                  return (
                    <tr key={coupon._id} className="hover:bg-royal-gold-50/40 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-royal-gold-100/70 text-royal-maroon-900 border border-royal-gold-300">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                            className="text-royal-brown-400 hover:text-royal-maroon-800 transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-royal-brown-500 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-royal-maroon-900">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-royal-gold-600" />
                              <span>{coupon.discountValue}% OFF</span>
                            </>
                          ) : (
                            <>
                              <IndianRupee className="w-3.5 h-3.5 text-royal-gold-600" />
                              <span>₹{coupon.discountValue.toLocaleString('en-IN')} OFF</span>
                            </>
                          )}
                        </div>
                        {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
                          <span className="text-[11px] text-royal-brown-500 block">
                            Up to ₹{coupon.maxDiscountAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-3.5 px-4 text-xs">
                        {coupon.minOrderAmount > 0 ? (
                          <span>₹{coupon.minOrderAmount.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-royal-brown-400">None</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-royal-maroon-900">{coupon.usedCount || 0}</span>
                        {coupon.usageLimit ? (
                          <span className="text-royal-brown-500"> / {coupon.usageLimit}</span>
                        ) : (
                          <span className="text-royal-brown-400"> (Unlimited)</span>
                        )}
                        {isLimitReached && (
                          <span className="block text-[10px] text-amber-600 font-medium">Limit reached</span>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 text-xs text-royal-brown-600">
                        {coupon.validUntil ? (
                          <div className={isExpired ? 'text-red-600 font-medium' : ''}>
                            {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {isExpired && <span className="block text-[10px]">Expired</span>}
                          </div>
                        ) : (
                          <span className="text-emerald-700">No Expiry</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon._id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            coupon.isActive && !isExpired && !isLimitReached
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.isActive && !isExpired && !isLimitReached ? 'bg-emerald-600' : 'bg-gray-500'
                            }`}
                          />
                          {coupon.isActive && !isExpired && !isLimitReached ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(coupon)}
                            title="Edit Coupon"
                            className="p-1.5 rounded hover:bg-royal-gold-100 text-royal-brown-600 hover:text-royal-maroon-900 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            title="Delete Coupon"
                            className="p-1.5 rounded hover:bg-red-50 text-royal-brown-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-maroon-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-royal-gold-300 shadow-royal-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-royal-gold-50/70 border-b border-royal-gold-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-royal-maroon-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-royal-gold-600" />
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-royal-brown-400 hover:text-royal-maroon-900 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHAADI50 or ROYALWEDDING"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 font-mono font-bold text-royal-maroon-900 uppercase focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special 25% launch discount on all royal themes"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                  />
                </div>

                {formData.discountType === 'percentage' ? (
                  <div>
                    <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 1000 (optional)"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                      Max Usage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 100 (optional)"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Valid Until (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-royal-maroon-800 border-royal-gold-400 focus:ring-royal-gold-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-royal-brown-800 cursor-pointer">
                  Activate this coupon immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-royal-gold-200">
                <Button variant="outline" size="sm" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={modalLoading}>
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1 text-royal-gold-300" />
                      Saving...
                    </>
                  ) : editingCoupon ? (
                    'Save Changes'
                  ) : (
                    'Create Coupon'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

