import React, { useState, useEffect } from 'react';
import { fetchAdminRsvps } from '../../services/api.js';
import {
  MailCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  RefreshCw,
  Loader2,
  X,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const RsvpManager = () => {
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    declined: 0,
    maybe: 0,
    totalHeadcount: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRsvps = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');
      const params = { page, limit: 20 };
      if (activeTab !== 'all') params.attendance = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await fetchAdminRsvps(params);
      setRsvps(res.data?.rsvps || (Array.isArray(res.data) ? res.data : []));
      if (res.stats) setStats(res.stats);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load RSVP responses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRsvps(1);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRsvps(1);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            RSVP Responses
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor real-time guest confirmations, ceremony headcounts, and blessings across all active weddings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadRsvps(pagination.page)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 RSVP KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-xs text-gray-500 font-medium">Total Responses</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-gray-400 mt-1">Headcount: {stats.totalHeadcount} guests</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-xs text-emerald-600 font-medium">Attending</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.attending}</div>
          <div className="text-[11px] text-emerald-600/70 mt-1">Confirmed Guests</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-xs text-rose-500 font-medium">Declined</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{stats.declined}</div>
          <div className="text-[11px] text-rose-500/70 mt-1">Regrets Sent</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-xs text-amber-500 font-medium">Tentative (Maybe)</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.maybe}</div>
          <div className="text-[11px] text-amber-500/70 mt-1">Awaiting Decision</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: `All Responses (${stats.total})` },
          { id: 'attending', label: `Attending (${stats.attending})` },
          { id: 'declined', label: `Declined (${stats.declined})` },
          { id: 'maybe', label: `Maybe (${stats.maybe})` },
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
            placeholder="Search by guest name, email, or ceremony..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => loadRsvps(1), 0);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Table Content */}
      {isLoading ? (
        <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#8B1D3B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading RSVP responses from registry...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={() => loadRsvps(1)}
            className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      ) : rsvps.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <MailCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No RSVP responses found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No responses match your search criteria. Try a different search query.'
              : activeTab !== 'all'
              ? `There are no responses marked as "${activeTab}".`
              : 'Guests who submit their RSVP through public invitation links will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4 font-semibold">Guest</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Ceremony</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Headcount</th>
                  <th className="py-3 px-4 font-semibold">Wedding Invitation</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rsvps.map((rsvp) => {
                  const rsvpId = rsvp._id || rsvp.id;
                  const dateStr = rsvp.respondedAt
                    ? new Date(rsvp.respondedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={rsvpId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        <div>{rsvp.guestName}</div>
                        {rsvp.guestPhone && (
                          <div className="text-[11px] text-gray-400 font-normal">{rsvp.guestPhone}</div>
                        )}
                        {rsvp.message && (
                          <div className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
                            "{rsvp.message}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{rsvp.guestEmail}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{rsvp.ceremonyTitle}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            rsvp.attendance === 'attending'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rsvp.attendance === 'declined'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {rsvp.attendance === 'attending' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : rsvp.attendance === 'declined' ? (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          <span className="capitalize">{rsvp.attendance}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {rsvp.attendance === 'attending' ? rsvp.guestCount : 0}
                      </td>
                      <td className="py-3 px-4">
                        {rsvp.invitationId ? (
                          <div className="text-gray-700">
                            <span className="font-medium block">
                              {rsvp.invitationId.brideName} &amp; {rsvp.invitationId.groomName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              /{rsvp.invitationId.slug}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">{dateStr}</td>
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
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} responses)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => loadRsvps(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadRsvps(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

