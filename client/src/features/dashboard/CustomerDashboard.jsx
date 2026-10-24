import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { FloralDivider, DiyaMotif } from '../../components/common/Motifs.jsx';
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
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();
  const customizationStore = useCustomizationStore();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'draft' | 'published'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actions feedback
  const [copiedSlug, setCopiedSlug] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setError(err.message || 'Failed to load invitations.');
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

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2500);
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
          prev.map((inv) =>
            (inv._id === invId || inv.id === invId ? res.data : inv)
          )
        );
      } else {
        const res = await publishInvitation(invId);
        setInvitations((prev) =>
          prev.map((inv) =>
            (inv._id === invId || inv.id === invId ? res.data : inv)
          )
        );
      }
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
      setInvitations((prev) =>
        prev.filter((inv) => inv._id !== invId && inv.id !== invId)
      );
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete invitation.');
    } finally {
      setIsDeleting(false);
    }
  };

  const publishedCount = invitations.filter((i) => i.status === 'published').length;
  const draftCount = invitations.filter((i) => i.status === 'draft').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Welcome Banner */}
      <div className="bg-royal-ivory-card border border-royal-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-royal-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-royal-gold-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-gold-100 border border-royal-gold-300 text-[11px] font-bold uppercase tracking-wider text-royal-brown-800 mb-3">
              <DiyaMotif className="w-3.5 h-3.5 text-royal-gold-700" />
              <span>Customer Invitation Suite</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-royal-maroon-800 tracking-wide">
              Namaste, {user?.name || 'Esteemed Guest'}
            </h1>
            <p className="text-xs sm:text-sm text-royal-brown-600 mt-2 max-w-xl">
              Manage your auspicious wedding invitations, update ceremony itineraries, and share live digital reveals with your cherished family and friends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/customize/theme-1">
              <Button variant="gold" size="md" className="shadow-gold-glow">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create New Invitation</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-royal-ivory-card border border-royal-gold-400/40 rounded-xl w-full sm:w-auto shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-royal-maroon-700 text-royal-gold-200 shadow-sm'
                : 'text-royal-brown-700 hover:text-royal-maroon-800'
            }`}
          >
            All ({invitations.length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'published'
                ? 'bg-royal-maroon-700 text-royal-gold-200 shadow-sm'
                : 'text-royal-brown-700 hover:text-royal-maroon-800'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'draft'
                ? 'bg-royal-maroon-700 text-royal-gold-200 shadow-sm'
                : 'text-royal-brown-700 hover:text-royal-maroon-800'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by couple name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-royal-ivory-card border border-royal-gold-400/50 text-royal-brown-900 focus:outline-none focus:border-royal-gold-600 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-royal-brown-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="font-bold underline ml-4 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invitations Grid / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 bg-royal-ivory-card/60 animate-pulse rounded-2xl border border-royal-gold-300/30 p-6"
            />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-royal-ivory-card border border-royal-gold-500/30 rounded-3xl shadow-royal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-royal-gold-100 text-royal-maroon-700 mb-4 border border-royal-gold-300">
            <Sparkles className="w-8 h-8 text-royal-gold-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-royal-maroon-800">
            No Wedding Invitations Found
          </h3>
          <p className="text-sm text-royal-brown-600 max-w-md mx-auto mt-2">
            {activeTab === 'published'
              ? 'You do not have any published invitations yet. Complete and publish a draft to receive a shareable link.'
              : activeTab === 'draft'
              ? 'You do not have any saved drafts right now.'
              : 'Begin creating your personalized royal Indian wedding invitation with 3D envelope reveals and customizable ceremony itineraries.'}
          </p>
          <div className="mt-6">
            <Link to="/customize/theme-1">
              <Button variant="gold" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                <span>Create Your First Invitation</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-royal-ivory-card border border-royal-gold-500/40 rounded-2xl overflow-hidden shadow-royal hover:shadow-royal-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Thumbnail / Card Header */}
                  <div className="relative h-44 bg-gradient-to-br from-royal-maroon-900 to-royal-brown-950 p-5 flex flex-col justify-between overflow-hidden">
                    {/* Background photo if available */}
                    {inv.photos && inv.photos.length > 0 && (
                      <img
                        src={inv.photos[0]}
                        alt={inv.brideName}
                        className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-maroon-950/90 via-royal-maroon-950/40 to-transparent" />

                    {/* Badge & Theme indicator */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-royal-gold-300 bg-royal-brown-950/70 px-2.5 py-1 rounded-full border border-royal-gold-400/40">
                        {inv.themeSlug ? inv.themeSlug.replace(/-/g, ' ') : 'Royal Palace'}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          isPublished
                            ? 'bg-emerald-900/80 text-emerald-300 border-emerald-400/60'
                            : 'bg-amber-900/80 text-amber-300 border-amber-400/60'
                        }`}
                      >
                        {isPublished ? 'Live & Published' : 'Private Draft'}
                      </span>
                    </div>

                    {/* Bride & Groom names */}
                    <div className="relative z-10">
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-royal-gold-200 drop-shadow-sm leading-tight">
                        {inv.brideName} & {inv.groomName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-royal-gold-400/90 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {weddingDateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-royal-brown-700">
                      <p className="font-semibold text-royal-maroon-800 truncate">
                        {inv.venue?.name || 'Grand Palace Venue'}
                      </p>
                      <p className="text-[11px] text-royal-brown-500 truncate mt-0.5">
                        {inv.events ? `${inv.events.length} Ceremonies Configured` : 'Ceremony Itinerary'}
                      </p>
                    </div>

                    <div className="text-[11px] text-royal-brown-400 pt-2 border-t border-royal-gold-300/30 flex items-center justify-between">
                      <span>Updated {updatedTimeStr}</span>
                      <span className="font-mono text-[10px] text-royal-gold-700 truncate max-w-[120px]">
                        /{inv.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-royal-gold-50/50 border-t border-royal-gold-300/30 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContinueEditing(inv)}
                      className="w-full text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit Draft</span>
                    </Button>

                    {isPublished ? (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => navigate(`/invite/${inv.slug}`)}
                        className="w-full text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>View Live</span>
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleTogglePublish(inv)}
                        isLoading={actionLoadingId === invId}
                        className="w-full text-xs"
                      >
                        <Globe className="w-3.5 h-3.5 mr-1" />
                        <span>Publish</span>
                      </Button>
                    )}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between pt-1">
                    {isPublished && (
                      <button
                        onClick={() => handleCopyLink(inv.slug)}
                        className="inline-flex items-center text-xs font-semibold text-royal-gold-800 hover:text-royal-maroon-800 transition-colors"
                      >
                        {copiedSlug === inv.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            <span className="text-emerald-700">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    )}

                    {isPublished ? (
                      <button
                        onClick={() => handleTogglePublish(inv)}
                        disabled={actionLoadingId === invId}
                        className="text-xs text-royal-brown-500 hover:text-amber-800 transition-colors ml-auto"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget(inv)}
                        className="text-xs text-red-600 hover:text-red-800 inline-flex items-center gap-1 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
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

      {/* Delete Confirmation Modal (Framework Native - No window.confirm) */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invitation Draft"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-4 py-2 text-center sm:text-left">
          <p className="text-sm text-royal-brown-700">
            Are you sure you want to permanently delete the invitation draft for{' '}
            <strong className="text-royal-maroon-800">
              {deleteTarget?.brideName} & {deleteTarget?.groomName}
            </strong>
            ? All custom ceremonies and photos will be removed.
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
