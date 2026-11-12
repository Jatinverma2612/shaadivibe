import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCustomizationStore } from '../../store/customizationStore.js';
import {
  fetchMyInvitations,
  deleteInvitation,
  publishInvitation,
  unpublishInvitation,
} from '../../services/api.js';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FloralDivider, DiyaMotif, LotusMotif } from '../../components/common/Motifs.jsx';
import {
  Sparkles,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  Trash2,
  Share2,
  Globe,
  FileEdit,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  MapPin,
  X,
  Layers,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const customizationStore = useCustomizationStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL tab sync or default to 'all'
  const tabParam = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actions feedback states
  const [copiedSlug, setCopiedSlug] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep state synced with URL tab parameter if user clicks sidebar filters
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'all' ? {} : { tab });
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchMyInvitations({
        status: activeTab,
        search: searchQuery,
      });
      setInvitations(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load invitations from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Trigger reload
    setIsLoading(true);
    fetchMyInvitations({ status: activeTab, search: '' })
      .then((res) => setInvitations(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setSuccessToast(`Invitation link copied to clipboard!`);
    setTimeout(() => {
      setCopiedSlug('');
      setSuccessToast('');
    }, 3000);
  };

  const handleContinueEditing = (invitation) => {
    customizationStore.loadInvitation(invitation);
    const themeId = invitation.themeSlug || 'royal-udaipur-palace';
    navigate(`/customize/${themeId}?edit=${invitation._id || invitation.id}`);
  };

  const handleTogglePublish = async (invitation) => {
    const invId = invitation._id || invitation.id;
    setActionLoadingId(invId);
    try {
      if (invitation.status === 'published') {
        const res = await unpublishInvitation(invId);
        setInvitations((prev) =>
          prev.map((inv) => (inv._id === invId || inv.id === invId ? res.data : inv))
        );
        setSuccessToast('Invitation unpublished and returned to private draft.');
      } else {
        const res = await publishInvitation(invId);
        setInvitations((prev) =>
          prev.map((inv) => (inv._id === invId || inv.id === invId ? res.data : inv))
        );
        setSuccessToast('Invitation published live! You can now share it with wedding guests.');
      }
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update publication status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const invId = deleteTarget._id || deleteTarget.id;
    try {
      await deleteInvitation(invId);
      setInvitations((prev) => prev.filter((inv) => inv._id !== invId && inv.id !== invId));
      setSuccessToast(`Draft for ${deleteTarget.brideName} & ${deleteTarget.groomName} deleted.`);
      setDeleteTarget(null);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete invitation.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive counts from actual customer dataset
  const publishedCount = useMemo(
    () => invitations.filter((i) => i.status === 'published').length,
    [invitations]
  );
  const draftCount = useMemo(
    () => invitations.filter((i) => i.status === 'draft').length,
    [invitations]
  );
  const totalCeremoniesCount = useMemo(
    () => invitations.reduce((acc, inv) => acc + (inv.events?.length || 0), 0),
    [invitations]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-royal-maroon-950 text-[#FDF3DA] px-5 py-3 rounded-2xl shadow-royal-lg border border-floral-gold flex items-center gap-3 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-800 to-royal-maroon-950 p-6 sm:p-8 lg:p-10 text-white shadow-royal-lg border-2 border-floral-gold/60 overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-palace-dark opacity-35 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-floral-gold/40 text-[11px] font-bold uppercase tracking-wider text-[#FDF3DA]">
              <DiyaMotif className="w-3.5 h-3.5 text-[#FDF3DA]" />
              <span>Personal Wedding Suite</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FDF3DA] tracking-wide">
              Namaste, {user?.name || 'Esteemed Couple'}
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF9F4]/90 max-w-xl leading-relaxed font-medium">
              Manage your royal Indian digital wedding invitations, ceremony timelines, high-definition photo galleries, and guest sharing links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/customize/theme-1">
              <Button
                variant="gold"
                size="lg"
                className="shadow-gold-glow text-[#260209] font-bold text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5 text-[#260209]" />
                <span>Create New Invitation</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Metric Cards (Derived from real customer data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-floral-gold/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-floral-gold">
            <span className="text-[11px] uppercase tracking-wider font-bold text-floral-brown/70">
              Total Invitations
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-floral-burgundy mt-2">
            {invitations.length}
          </span>
          <span className="text-[10px] text-floral-brown/60 mt-1">In your studio</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-floral-gold/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] uppercase tracking-wider font-bold text-floral-brown/70">
              Live & Published
            </span>
            <Globe className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
            {publishedCount}
          </span>
          <span className="text-[10px] text-floral-brown/60 mt-1">Accessible by guests</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-floral-gold/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] uppercase tracking-wider font-bold text-floral-brown/70">
              Saved Drafts
            </span>
            <FileEdit className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">
            {draftCount}
          </span>
          <span className="text-[10px] text-floral-brown/60 mt-1">Ready for editing</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-floral-gold/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-floral-gold">
            <span className="text-[11px] uppercase tracking-wider font-bold text-floral-brown/70">
              Ceremonies
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-floral-burgundy mt-2">
            {totalCeremoniesCount}
          </span>
          <span className="text-[10px] text-floral-brown/60 mt-1">Haldi, Sangeet & more</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-white border border-floral-gold/40 rounded-2xl w-full sm:w-auto shadow-xs">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-floral-burgundy text-[#FFF9F4] shadow-xs'
                : 'text-floral-brown hover:text-floral-burgundy'
            }`}
          >
            All ({invitations.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'published'
                ? 'bg-floral-burgundy text-[#FFF9F4] shadow-xs'
                : 'text-floral-brown hover:text-floral-burgundy'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('draft')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'draft'
                ? 'bg-floral-burgundy text-[#FFF9F4] shadow-xs'
                : 'text-floral-brown hover:text-floral-burgundy'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Real-time Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by couple name or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-floral-gold/40 text-floral-brown focus:outline-none focus:border-floral-gold shadow-xs font-medium"
            />
            <Search className="w-3.5 h-3.5 text-floral-gold absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-floral-brown/60 hover:text-floral-burgundy"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline" size="sm" className="font-semibold text-xs shrink-0">
            Search
          </Button>
        </form>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-between text-xs text-red-700 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="font-bold underline ml-4 hover:text-red-900 inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Invitations Collection Grid & States */}
      {isLoading ? (
        /* Skeleton Loading State */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-88 bg-white/70 animate-pulse rounded-2xl border border-floral-gold/20 p-5 space-y-4"
            >
              <div className="h-44 bg-floral-blush/60 rounded-xl" />
              <div className="h-4 bg-floral-blush/60 rounded w-3/4" />
              <div className="h-3 bg-floral-blush/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        /* Empty States */
        <div className="text-center py-16 px-6 bg-white border border-floral-gold/30 rounded-3xl shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-floral-blush border border-floral-gold/40 flex items-center justify-center text-floral-burgundy mx-auto mb-4 shadow-xs">
            {searchQuery ? (
              <Search className="w-7 h-7 text-floral-gold" />
            ) : (
              <LotusMotif className="w-8 h-8 text-floral-gold" />
            )}
          </div>

          <h3 className="font-serif text-2xl font-bold text-floral-burgundy">
            {searchQuery
              ? `No Invitations Found for "${searchQuery}"`
              : activeTab === 'published'
              ? 'No Published Invitations Yet'
              : activeTab === 'draft'
              ? 'No Private Drafts Saved'
              : 'No Wedding Invitations Found'}
          </h3>

          <p className="text-xs sm:text-sm text-floral-brown/85 max-w-md mx-auto mt-2 leading-relaxed">
            {searchQuery
              ? 'Try searching with different couple names, ceremony keywords, or clear your search query.'
              : activeTab === 'published'
              ? 'Complete and publish a draft invitation to receive a live, shareable WhatsApp link.'
              : activeTab === 'draft'
              ? 'You have no saved drafts at the moment. Create your first invitation to start customizing.'
              : 'Begin crafting your bespoke royal Indian wedding invitation with 3D envelope unwrapping and customizable ceremony itinerary.'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {searchQuery ? (
              <Button variant="outline" size="md" onClick={handleClearSearch}>
                Clear Search Query
              </Button>
            ) : (
              <Link to="/customize/theme-1">
                <Button variant="gold" size="md" className="shadow-gold-glow">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Create Your First Invitation</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Redesigned Invitation Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {invitations.map((inv) => {
            const isPublished = inv.status === 'published';
            const invId = inv._id || inv.id;
            const weddingDateStr = inv.weddingDate
              ? new Date(inv.weddingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Date Pending';
            const updatedTimeStr = inv.updatedAt
              ? new Date(inv.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={invId}
                className="bg-white border border-floral-gold/35 rounded-2xl overflow-hidden shadow-sm hover:shadow-royal hover:border-floral-gold transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Media Cover / Header */}
                  <div className="relative h-48 bg-gradient-to-br from-royal-maroon-900 via-royal-maroon-850 to-royal-maroon-950 p-5 flex flex-col justify-between overflow-hidden">
                    {/* Background photo if available */}
                    {inv.photos && inv.photos.length > 0 && (
                      <img
                        src={inv.photos[0]}
                        alt={`${inv.brideName} and ${inv.groomName}`}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-maroon-950/90 via-royal-maroon-950/50 to-transparent" />

                    {/* Top Row: Theme badge + Status badge */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#FDF3DA] bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-floral-gold/40 shadow-xs truncate max-w-[140px]">
                        {inv.themeSlug ? inv.themeSlug.replace(/-/g, ' ') : 'Royal Palace'}
                      </span>

                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${
                          isPublished
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50'
                            : 'bg-amber-950/90 text-amber-300 border-amber-400/50'
                        }`}
                      >
                        {isPublished ? '● Live & Published' : '○ Private Draft'}
                      </span>
                    </div>

                    {/* Couple Names & Date */}
                    <div className="relative z-10 mt-auto pt-4">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FDF3DA] drop-shadow-sm leading-tight truncate">
                        {inv.brideName} & {inv.groomName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#FFF9F4]/90 mt-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-floral-gold shrink-0" />
                        <span>{weddingDateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-floral-burgundy font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 text-floral-gold shrink-0" />
                        <span className="truncate">{inv.venue?.name || 'Grand Palace Venue'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-floral-brown/75 text-[11px] font-medium pl-5">
                        <Clock className="w-3 h-3 text-floral-gold shrink-0" />
                        <span>{inv.events?.length || 0} Ceremonies Configured</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-floral-brown/60 pt-2.5 border-t border-floral-gold/20 flex items-center justify-between">
                      <span>Updated: {updatedTimeStr}</span>
                      <span className="font-mono text-[10px] text-floral-gold font-bold truncate max-w-[140px]">
                        /invite/{inv.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-floral-blush/30 border-t border-floral-gold/25 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContinueEditing(inv)}
                      className="w-full text-xs font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit Draft</span>
                    </Button>

                    {isPublished ? (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => navigate(`/invite/${inv.slug}`)}
                        className="w-full text-xs font-semibold text-[#260209]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#260209]" />
                        <span>View Live</span>
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleTogglePublish(inv)}
                        isLoading={actionLoadingId === invId}
                        className="w-full text-xs font-semibold text-[#260209]"
                      >
                        <Globe className="w-3.5 h-3.5 mr-1 text-[#260209]" />
                        <span>Publish</span>
                      </Button>
                    )}
                  </div>

                  {/* Secondary Share / Status Row */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    {isPublished ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.slug)}
                          className="inline-flex items-center gap-1 font-semibold text-floral-gold hover:text-floral-burgundy transition-colors"
                        >
                          {copiedSlug === inv.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(inv)}
                          disabled={actionLoadingId === invId}
                          className="text-floral-brown/70 hover:text-amber-800 transition-colors ml-auto font-medium"
                        >
                          Unpublish
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(inv)}
                        className="text-red-700 hover:text-red-900 inline-flex items-center gap-1 transition-colors ml-auto font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Draft</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Framework Native - Accessible) */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invitation Draft"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-4 py-2 text-center sm:text-left">
          <p className="text-sm text-floral-brown leading-relaxed">
            Are you sure you want to permanently delete the invitation draft for{' '}
            <strong className="text-floral-burgundy font-bold">
              {deleteTarget?.brideName} & {deleteTarget?.groomName}
            </strong>
            ? All customized ceremonies, dates, venues, and photos will be removed.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={confirmDelete}
              isLoading={isDeleting}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white border-red-800"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Confirm Delete</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
