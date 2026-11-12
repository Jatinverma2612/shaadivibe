import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminTickets, updateTicket } from '../../services/api.js';
import { Button } from '../../components/common/Button.jsx';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalStatus, setModalStatus] = useState('open');
  const [modalPriority, setModalPriority] = useState('medium');
  const [modalNotes, setModalNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminTickets({
        page,
        limit: 15,
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      });
      if (res.success) {
        setTickets(res.data.tickets || []);
        setTotalCount(res.data.total || 0);
        setStats(res.data.stats || { all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0 });
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError(err.message || 'Unable to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalStatus(ticket.status || 'open');
    setModalPriority(ticket.priority || 'medium');
    setModalNotes(ticket.adminNotes || '');
    setModalFeedback(null);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setModalFeedback(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    setModalFeedback(null);

    try {
      const res = await updateTicket(selectedTicket._id, {
        status: modalStatus,
        priority: modalPriority,
        adminNotes: modalNotes.trim(),
      });

      setModalFeedback({ type: 'success', message: 'Ticket updated successfully.' });
      setSelectedTicket(res.data);
      loadTickets();
    } catch (err) {
      setModalFeedback({ type: 'error', message: err.message || 'Failed to update ticket.' });
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" /> Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> High
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Medium
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" /> In Progress
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-royal-maroon-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-royal-gold-600" />
            Support & Customer Inquiries
          </h1>
          <p className="text-sm text-royal-brown-600 mt-1">
            Track customer requests, invitation customization queries, and resolve technical issues.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-royal-gold-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-royal-brown-500 font-medium">Total Tickets</p>
            <p className="text-2xl font-serif font-bold text-royal-maroon-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-royal-gold-50 flex items-center justify-center text-royal-gold-700">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-700 font-medium">Awaiting Action</p>
            <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{stats.open}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-sky-200/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-sky-700 font-medium">In Progress</p>
            <p className="text-2xl font-serif font-bold text-sky-800 mt-1">{stats.in_progress}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-medium">Resolved</p>
            <p className="text-2xl font-serif font-bold text-emerald-800 mt-1">{stats.resolved}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-royal-gold-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-royal-brown-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ticket #, customer, subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-royal-gold-300 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-royal-gold-50/60 p-1 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-royal-maroon-800 text-royal-gold-200 shadow-sm font-semibold'
                    : 'text-royal-brown-700 hover:bg-royal-gold-100/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-royal-gold-200/70 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-royal-gold-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-royal-brown-600">Loading support inquiries...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <LifeBuoy className="w-12 h-12 text-royal-gold-400 mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-royal-maroon-900 mb-1">No Tickets Found</h3>
            <p className="text-sm text-royal-brown-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try clearing filters to view more support requests.'
                : 'All customer support tickets have been graciously resolved!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-royal-brown-800">
              <thead className="bg-royal-gold-50/60 border-b border-royal-gold-200/70 text-xs uppercase tracking-wider text-royal-maroon-900 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject & Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-royal-gold-50/40 transition-colors">
                    {/* Ticket # */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-royal-gold-100/70 text-royal-maroon-900 border border-royal-gold-300">
                        {t.ticketNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-royal-maroon-900 text-xs sm:text-sm">
                        {t.customerSnapshot?.name || 'Guest User'}
                      </div>
                      <div className="text-xs text-royal-brown-500">{t.customerSnapshot?.email}</div>
                    </td>

                    {/* Subject & Category */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-royal-brown-900 truncate text-xs sm:text-sm">
                        {t.subject}
                      </p>
                      <span className="text-[11px] capitalize text-royal-gold-800 bg-royal-gold-50 px-1.5 py-0.5 rounded border border-royal-gold-200/60 mt-0.5 inline-block">
                        {t.category ? t.category.replace('_', ' ') : 'General'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">{getPriorityBadge(t.priority)}</td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-royal-brown-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(t)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-royal-maroon-50 text-royal-maroon-800 hover:bg-royal-maroon-100 border border-royal-maroon-200 transition-colors"
                      >
                        Manage
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details & Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-maroon-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-royal-gold-300 shadow-royal-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-royal-gold-50/80 border-b border-royal-gold-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-royal-gold-200/70 text-royal-maroon-900 border border-royal-gold-300">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-royal-gold-800 font-semibold">
                    Support Ticket Details
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-royal-maroon-900 mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-royal-brown-400 hover:text-royal-maroon-900 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {modalFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {modalFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{modalFeedback.message}</span>
                </div>
              )}

              {/* Customer Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-royal-gold-50/50 border border-royal-gold-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-royal-gold-700 shrink-0" />
                  <div>
                    <span className="text-royal-brown-400 block text-[10px] uppercase">Customer</span>
                    <span className="font-semibold text-royal-maroon-900">
                      {selectedTicket.customerSnapshot?.name || 'Guest User'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-royal-gold-700 shrink-0" />
                  <div>
                    <span className="text-royal-brown-400 block text-[10px] uppercase">Email</span>
                    <span className="font-medium text-royal-brown-800 truncate block max-w-[150px]">
                      {selectedTicket.customerSnapshot?.email || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-royal-gold-700 shrink-0" />
                  <div>
                    <span className="text-royal-brown-400 block text-[10px] uppercase">Created Date</span>
                    <span className="font-medium text-royal-brown-800">
                      {new Date(selectedTicket.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div>
                <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1.5">
                  Customer Message / Inquiry
                </label>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-royal-brown-900 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Management Form: Status, Priority, Admin Notes */}
              <form onSubmit={handleSaveTicket} className="space-y-4 pt-2 border-t border-royal-gold-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                      Update Ticket Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                    >
                      <option value="open">Open (Awaiting response)</option>
                      <option value="in_progress">In Progress (Investigating)</option>
                      <option value="resolved">Resolved (Completed)</option>
                      <option value="closed">Closed (Archived)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                      Priority Level
                    </label>
                    <select
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 bg-white text-royal-brown-800 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-royal-maroon-900 uppercase tracking-wider mb-1">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add internal resolution notes, customer conversation records, or instructions..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-royal-gold-300 text-royal-brown-800 focus:outline-none focus:ring-2 focus:ring-royal-gold-500/50 text-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={handleCloseModal}>
                    Close
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1 text-royal-gold-300" />
                        Updating...
                      </>
                    ) : (
                      'Save Ticket Changes'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

