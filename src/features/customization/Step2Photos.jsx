import React, { useState, useRef } from 'react';
import { useCustomizationStore } from '../../store/customizationStore.js';
import { uploadPhotos as uploadPhotosApi } from '../../services/api.js';
import { photoUploadValidation } from '../../utils/validationSchemas.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const Step2Photos = ({ onNext, onPrev }) => {
  const store = useCustomizationStore();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    setUploadSuccess('');

    // Check max file limit
    const availableSlots = photoUploadValidation.maxFiles - store.photos.length;
    if (files.length > availableSlots) {
      setUploadError(`You can only upload up to ${photoUploadValidation.maxFiles} photos total. (${availableSlots} slots remaining)`);
      return;
    }

    // Validate size and mime types
    for (const file of files) {
      if (file.size > photoUploadValidation.maxFileSize) {
        setUploadError(`"${file.name}" exceeds the maximum allowed size of 5MB.`);
        return;
      }
      if (!photoUploadValidation.acceptedTypes.includes(file.type)) {
        setUploadError(`"${file.name}" is not a valid format. Please upload JPG, PNG, or WebP.`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const res = await uploadPhotosApi(files);
      if (res.urls && res.urls.length > 0) {
        store.addPhotos(res.urls);
        setUploadSuccess(`Successfully added ${res.urls.length} photo(s)!`);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <Card ornate={false} className="p-6 sm:p-8 bg-royal-ivory-card border-2 border-royal-gold-400/50 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-royal-gold-500/20">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-royal-maroon-700" />
            <h3 className="font-serif text-lg font-bold text-royal-maroon-800">
              Couple & Celebration Photos
            </h3>
          </div>
          <span className="text-xs font-semibold text-royal-gold-800 bg-royal-gold-100 px-3 py-1 rounded-full">
            {store.photos.length} of {photoUploadValidation.maxFiles} Photos Uploaded
          </span>
        </div>

        <p className="text-xs text-royal-brown-600 mb-6">
          Upload romantic pre-wedding portraits or couple memories to personalize the royal invitation experience.
        </p>

        {/* Upload Dropzone */}
        {store.photos.length < photoUploadValidation.maxFiles && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-royal-gold-400 hover:border-royal-gold-600 bg-royal-gold-50/40 hover:bg-royal-gold-50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group mb-8"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-full bg-royal-gold-100 text-royal-gold-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h4 className="font-serif text-base font-bold text-royal-maroon-800">
              {isUploading ? 'Uploading Photos...' : 'Click to Upload or Drag & Drop'}
            </h4>
            <p className="text-xs text-royal-brown-600 mt-1">
              Supports high-definition JPG, PNG, and WebP (Max 5MB each, up to {photoUploadValidation.maxFiles} photos)
            </p>
          </div>
        )}

        {/* Status Alerts */}
        {uploadError && (
          <div className="p-3 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Preview Gallery Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-royal-brown-700">
            Current Photo Gallery ({store.photos.length})
          </h4>

          {store.photos.length === 0 ? (
            <div className="p-8 text-center border border-royal-gold-300/40 rounded-xl bg-royal-ivory-warm/40">
              <p className="text-xs text-royal-brown-500 italic">
                No photos uploaded yet. You can proceed without photos or upload them anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {store.photos.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-royal-gold-400/50 shadow-sm bg-royal-ivory-warm"
                >
                  <img
                    src={url}
                    alt={`Couple photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Remove Button Overlay */}
                  <button
                    type="button"
                    onClick={() => store.removePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-royal-maroon-900/80 text-white hover:bg-red-600 transition-colors shadow-md"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1.5 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Photo {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="md" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Details (Step 1)</span>
        </Button>

        <Button variant="gold" size="lg" onClick={onNext}>
          <span>Continue to Final Preview (Step 3)</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
