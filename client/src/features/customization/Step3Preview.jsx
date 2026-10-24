import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveInvitation, publishInvitation } from '../../services/api.js';
import { InvitationRenderer } from '../invitation/InvitationRenderer.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Edit3,
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';

export const Step3Preview = ({ onPrev, onGoToStep }) => {
  const store = useCustomizationStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState(store.slug || '');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Assemble dynamic invitation object from current store state
  const currentInvitation = {
    _id: store.invitationId || undefined,
    slug: store.slug || 'live-custom-preview',
    themeSlug: store.selectedThemeSlug,
    brideName: store.brideName,
    groomName: store.groomName,
    weddingDate: store.weddingDate,
    weddingTime: store.weddingTime,
    language: store.language,
    tagline: store.tagline,
    familyMessage: store.familyMessage,
    venue: store.venue,
    photos: store.photos,
    interactiveCards: store.interactiveCards,
    events: store.events,
    status: store.status || 'draft',
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setFeedbackMessage('');
    setErrorMessage('');
    store.setSaveStatus('saving');

    try {
      const payload = {
        ...currentInvitation,
        status: 'draft',
      };
      const res = await saveInvitation(payload);
      if (res.data?._id) {
        store.setInvitationId(res.data._id, res.data.slug);
      }
      store.setSaveStatus('saved');
      setFeedbackMessage('Draft preserved securely to MongoDB! You can resume editing anytime.');
      setTimeout(() => setFeedbackMessage(''), 4500);
    } catch (err) {
      store.setSaveStatus('error', err.message);
      setErrorMessage(err.message || 'Failed to save draft to server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setFeedbackMessage('');
    setErrorMessage('');
    store.setSaveStatus('saving');

    try {
      const payload = {
        ...currentInvitation,
        status: 'published',
      };

      const res = await saveInvitation(payload);
      const savedData = res.data;
      const slug = savedData?.slug || `${store.brideName.toLowerCase()}-weds-${store.groomName.toLowerCase()}`;
      
      if (savedData?._id) {
        store.setInvitationId(savedData._id, slug);
      }
      
      store.setSaveStatus('saved');
      setPublishedSlug(slug);
      setShowShareModal(true);
    } catch (err) {
      store.setSaveStatus('error', err.message);
      setErrorMessage(err.message || 'Error publishing invitation. Please ensure all names and dates are complete.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/invite/${publishedSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="sticky top-20 z-30 bg-royal-ivory-card/95 backdrop-blur-md border border-royal-gold-500/40 rounded-2xl p-4 sm:p-5 shadow-royal flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-royal-gold-600" />
            <span className="font-serif text-base font-bold text-royal-maroon-800">
              Live Interactive Preview
            </span>
            {store.lastSaved && (
              <span className="text-[10px] text-royal-brown-500 bg-royal-gold-100/60 px-2 py-0.5 rounded-full border border-royal-gold-300/40">
                Saved {new Date(store.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-xs text-royal-brown-600 mt-0.5">
            Test the unwrap animation and event timeline exactly as your guests will experience it.
          </p>
          {feedbackMessage && (
            <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{feedbackMessage}</span>
            </p>
          )}
          {errorMessage && (
            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => onGoToStep(1)}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Details
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Draft
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handlePublish}
            isLoading={isSaving}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Publish & Share Link
          </Button>
        </div>
      </div>

      {/* Embedded Real-Time Invitation Renderer */}
      <div className="rounded-2xl border-2 border-royal-gold-500/50 overflow-hidden shadow-royal-lg bg-mandap-pattern">
        <InvitationRenderer customInvitation={currentInvitation} />
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="md" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Photos (Step 2)</span>
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleSaveDraft} isLoading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            <span>Save Draft</span>
          </Button>

          <Button variant="gold" size="lg" onClick={handlePublish} isLoading={isSaving}>
            <Send className="w-5 h-5 mr-2" />
            <span>Publish & Share Invitation</span>
          </Button>
        </div>
      </div>

      {/* Published Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Royal Invitation is Live!"
        subtitle="Auspicious Blessings & Congratulations"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-sm text-royal-brown-700">
            Your personalized digital wedding invitation for{' '}
            <strong className="text-royal-maroon-800">
              {store.brideName} & {store.groomName}
            </strong>{' '}
            is published with a unique public URL.
          </p>

          <div className="p-3 bg-royal-gold-50 border border-royal-gold-400 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs text-royal-brown-800 font-mono truncate">
              {window.location.origin}/invite/{publishedSlug}
            </span>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Go to Dashboard
            </Button>

            <Button
              variant="gold"
              size="md"
              onClick={() => navigate(`/invite/${publishedSlug}`)}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Open Live Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
