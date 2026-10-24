import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { saveInvitation } from '../../services/api.js';
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
} from 'lucide-react';

export const Step3Preview = ({ onPrev, onGoToStep }) => {
  const store = useCustomizationStore();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');

  // Assemble dynamic invitation object from current store state
  const currentInvitation = {
    slug: 'live-custom-preview',
    themeSlug: store.selectedThemeSlug,
    brideName: store.brideName,
    groomName: store.groomName,
    weddingDate: store.weddingDate,
    language: store.language,
    tagline: store.tagline,
    familyMessage: store.familyMessage,
    venue: store.venue,
    photos: store.photos,
    interactiveCards: store.interactiveCards,
    events: store.events,
    status: 'published',
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setDraftSavedMessage('');
    try {
      localStorage.setItem('shaadivibe_draft_customization', JSON.stringify(currentInvitation));
      setDraftSavedMessage('Draft saved successfully to your local browser storage!');
      setTimeout(() => setDraftSavedMessage(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const res = await saveInvitation(currentInvitation);
      const slug = res.data?.slug || `${store.brideName.toLowerCase()}-weds-${store.groomName.toLowerCase()}`;
      setPublishedSlug(slug);
      setShowShareModal(true);
    } catch (err) {
      alert(`Error saving invitation: ${err.message}`);
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
          </div>
          <p className="text-xs text-royal-brown-600 mt-0.5">
            Test the unwrap animation and event timeline exactly as your guests will experience it.
          </p>
          {draftSavedMessage && (
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              ✓ {draftSavedMessage}
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

        <Button variant="gold" size="lg" onClick={handlePublish}>
          <Send className="w-5 h-5 mr-2" />
          <span>Publish & Share Invitation</span>
        </Button>
      </div>

      {/* Published Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Royal Invitation is Ready!"
        subtitle="Auspicious Blessings & Congratulations"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-sm text-royal-brown-700">
            Your personalized digital wedding invitation for{' '}
            <strong className="text-royal-maroon-800">
              {store.brideName} & {store.groomName}
            </strong>{' '}
            is live and ready to share with your esteemed guests!
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

          <div className="flex gap-3 justify-center pt-2">
            <Button
              variant="gold"
              size="md"
              onClick={() => navigate(`/invite/${publishedSlug}`)}
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
