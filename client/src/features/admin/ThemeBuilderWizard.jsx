import React, { useState, useEffect, useMemo } from 'react';
import {
  createTheme,
  updateTheme,
  uploadThemeAsset,
  fetchCategories,
  createCategory,
} from '../../services/api.js';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Video,
  Image as ImageIcon,
  FileText,
  Globe,
  Calendar,
  Layers,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GripVertical,
  X,
  Tag,
  IndianRupee,
  Film,
  FileArchive,
  Info,
} from 'lucide-react';

const DEFAULT_CUSTOMIZATION_FIELDS = [
  { key: 'brideName', label: "Bride's Name", type: 'text', required: true, order: 1, placeholder: 'Priya Sharma' },
  { key: 'groomName', label: "Groom's Name", type: 'text', required: true, order: 2, placeholder: 'Rahul Verma' },
  { key: 'weddingDate', label: 'Wedding Date', type: 'date', required: true, order: 3, placeholder: '2026-12-15' },
  { key: 'venue', label: 'Venue / Location', type: 'text', required: true, order: 4, placeholder: 'Umaid Bhawan Palace, Jodhpur' },
  { key: 'familyText', label: 'Family Invitation Text', type: 'textarea', required: false, order: 5, placeholder: 'Together with their families cordially invite you...' },
  { key: 'photos', label: 'Couple Photos (2-5)', type: 'image', required: false, order: 6, placeholder: 'Couple portrait & ceremony gallery' },
  { key: 'events', label: 'Function Details', type: 'repeater', required: false, order: 7, placeholder: 'Haldi, Mehendi, Sangeet, Wedding Pheras, Reception' },
];

const STYLE_OPTIONS = [
  'Traditional',
  'Cartoon',
  'Royal',
  'Destination',
  'Floral',
  'Regional',
  'Minimal',
  'Religious',
  'Modern',
  'Other',
];

const DEFAULT_CATEGORIES_FALLBACK = [
  'Royal',
  'Traditional',
  'Floral',
  'Minimal',
  'Modern',
  'Cartoon',
  'Destination',
  'Regional',
];

export const ThemeBuilderWizard = ({ initialTheme, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [themeId, setThemeId] = useState(initialTheme?._id || initialTheme?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: initialTheme?.name || '',
    slug: initialTheme?.slug || '',
    description: initialTheme?.description || '',
    category: initialTheme?.category || 'Royal',
    themeType: initialTheme?.themeType || 'both',
    tags: initialTheme?.tags || ['Royal', 'Traditional'],
    languages: initialTheme?.languages || ['English', 'Hindi'],
    coverImage: initialTheme?.coverImage || '',
    videoUrl: initialTheme?.videoUrl || '',
    videoDuration: initialTheme?.videoDuration || '00:30',
    templateFile: initialTheme?.templateFile || { url: '', filename: '', size: 0, uploadedAt: null },
    customizationFields: initialTheme?.customizationFields?.length > 0
      ? initialTheme.customizationFields
      : DEFAULT_CUSTOMIZATION_FIELDS,
    priceDisplay: initialTheme?.priceDisplay ?? 1999,
    offerPrice: initialTheme?.offerPrice ?? 1499,
    package: initialTheme?.themeType === 'video' ? 'Video Only' : initialTheme?.themeType === 'website' ? 'Website Only' : 'Video + Website',
    hostingDurationMonths: initialTheme?.hostingDurationMonths ?? 12,
    maxFunctions: initialTheme?.maxFunctions ?? 5,
    status: initialTheme?.status || (initialTheme?.isPublished === false ? 'draft' : 'active'),
    isFeatured: Boolean(initialTheme?.isFeatured),
    displayOrder: initialTheme?.displayOrder ?? 1,
    seoTitle: initialTheme?.seoTitle || (initialTheme?.name ? `${initialTheme.name} Wedding Invitation | ShaadiVibe` : ''),
  });

  // New field modal state
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    key: '',
    type: 'text',
    required: false,
    placeholder: '',
  });

  // Dynamic categories state
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState('');

  // Fetch dynamic categories on mount
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const cats = await fetchCategories();
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        }
      } catch (err) {
        console.warn('Failed to load categories in wizard:', err.message);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute effective categories ensuring current formData.category is included
  const effectiveCategories = useMemo(() => {
    const list =
      categoriesList.length > 0
        ? categoriesList
        : DEFAULT_CATEGORIES_FALLBACK.map((c) => ({ name: c }));

    if (formData.category && !list.some((c) => c.name.toLowerCase() === formData.category.toLowerCase())) {
      return [...list, { name: formData.category }];
    }
    return list;
  }, [categoriesList, formData.category]);

  // Handle Quick Create Category
  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) {
      setCategoryModalError('Category name is required.');
      return;
    }
    try {
      setIsCreatingCategory(true);
      setCategoryModalError('');
      const res = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });
      const created = res.data;
      setCategoriesList((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === created.name.toLowerCase());
        return exists ? prev : [...prev, created];
      });
      setFormData((prev) => ({ ...prev, category: created.name }));
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsNewCategoryModalOpen(false);
      setSuccessMessage(`Category "${created.name}" created and selected.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setCategoryModalError(err.message || 'Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Auto-slugify from name if slug not explicitly modified
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        ? val.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : prev.slug,
      seoTitle: prev.seoTitle === '' || prev.seoTitle.includes(prev.name)
        ? `${val} Wedding Invitation | ShaadiVibe`
        : prev.seoTitle,
    }));
  };

  // Toggle style tags
  const toggleTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  // Toggle languages
  const toggleLanguage = (lang) => {
    setFormData((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
      };
    });
  };

  // Handle Cover Thumbnail Upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      const uploaded = await uploadThemeAsset(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: uploaded.url,
      }));
    } catch (err) {
      setUploadError(err.message || 'Failed to upload thumbnail image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Preview Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      const uploaded = await uploadThemeAsset(file);
      setFormData((prev) => ({
        ...prev,
        videoUrl: uploaded.url,
      }));
    } catch (err) {
      setUploadError(err.message || 'Failed to upload video file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Template ZIP Upload
  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      const uploaded = await uploadThemeAsset(file);
      setFormData((prev) => ({
        ...prev,
        templateFile: {
          url: uploaded.url,
          filename: uploaded.filename || file.name,
          size: uploaded.size || file.size,
          uploadedAt: new Date(),
        },
      }));
    } catch (err) {
      setUploadError(err.message || 'Failed to upload template package.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Custom Field
  const handleAddNewField = () => {
    if (!newField.label.trim()) return;
    const generatedKey = newField.key.trim()
      ? newField.key.trim()
      : newField.label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const added = {
      key: generatedKey,
      label: newField.label.trim(),
      type: newField.type,
      required: Boolean(newField.required),
      order: formData.customizationFields.length + 1,
      placeholder: newField.placeholder || '',
    };

    setFormData((prev) => ({
      ...prev,
      customizationFields: [...prev.customizationFields, added],
    }));

    setNewField({ label: '', key: '', type: 'text', required: false, placeholder: '' });
    setIsAddFieldOpen(false);
  };

  // Remove Custom Field
  const handleRemoveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customizationFields: prev.customizationFields.filter((_, idx) => idx !== index),
    }));
  };

  // Build Payload
  const buildPayload = (forcePublish = false, forceDraft = false) => {
    let published = formData.status === 'active';
    let statusVal = formData.status;

    if (forcePublish) {
      published = true;
      statusVal = 'active';
    } else if (forceDraft) {
      published = false;
      statusVal = 'draft';
    }

    let formats = ['Interactive Website'];
    if (formData.themeType === 'video') {
      formats = ['Video Invitation'];
    } else if (formData.themeType === 'both') {
      formats = ['Interactive Website', 'Video Invitation'];
    }

    return {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: formData.description,
      category: formData.category,
      themeType: formData.themeType,
      tags: formData.tags,
      languages: formData.languages,
      coverImage: formData.coverImage.trim() || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      videoUrl: formData.videoUrl,
      videoDuration: formData.videoDuration,
      templateFile: formData.templateFile,
      customizationFields: formData.customizationFields,
      priceDisplay: Number(formData.priceDisplay) || 0,
      offerPrice: Number(formData.offerPrice) || 0,
      hostingDurationMonths: Number(formData.hostingDurationMonths) || 12,
      maxFunctions: Number(formData.maxFunctions) || 5,
      status: statusVal,
      isPublished: published,
      isFeatured: Boolean(formData.isFeatured),
      displayOrder: Number(formData.displayOrder) || 0,
      seoTitle: formData.seoTitle,
      supportedFormats: formats,
    };
  };

  // Save as Draft (Any Step)
  const handleSaveDraft = async () => {
    if (!formData.name.trim()) {
      setFormError('Please enter at least a Theme Name to save a draft.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const payload = buildPayload(false, true);

      let saved;
      if (themeId) {
        saved = await updateTheme(themeId, payload);
      } else {
        saved = await createTheme(payload);
        if (saved?.data?._id || saved?.data?.id) {
          setThemeId(saved.data._id || saved.data.id);
        }
      }

      setSuccessMessage('Draft saved securely to MongoDB Atlas.');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setFormError(err.message || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Publish (Step 5)
  const handleFinalPublish = async () => {
    if (!formData.name.trim()) {
      setFormError('Theme Name is required.');
      setCurrentStep(1);
      return;
    }
    if (!formData.coverImage.trim()) {
      setFormError('Theme Thumbnail Cover Image is required.');
      setCurrentStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const payload = buildPayload(true, false);

      if (themeId) {
        await updateTheme(themeId, payload);
      } else {
        await createTheme(payload);
      }

      setSuccessMessage('Theme published successfully to the royal registry!');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);
    } catch (err) {
      setFormError(err.message || 'Failed to publish theme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate current step before proceeding to next
  const handleNextStep = () => {
    setFormError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setFormError('Please provide a Theme Name before proceeding.');
        return;
      }
      if (!formData.slug.trim()) {
        setFormError('Please provide a valid URL slug.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.coverImage.trim()) {
        setFormError('Please upload or specify a cover thumbnail image.');
        return;
      }
    } else if (currentStep === 4) {
      if (formData.priceDisplay < 0 || formData.offerPrice < 0) {
        setFormError('Prices cannot be negative numbers.');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalPublish();
    }
  };

  const steps = [
    { number: 1, label: 'Basic Details' },
    { number: 2, label: 'Media & Templates' },
    { number: 3, label: 'Customization' },
    { number: 4, label: 'Pricing & Settings' },
    { number: 5, label: 'Preview & Publish' },
  ];

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-[#8B1D3B] transition-colors font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Themes</span>
            </button>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold">
              {themeId ? `Edit Theme: ${formData.name || 'Untitled'}` : 'Add New Theme'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {themeId ? 'Edit Theme' : 'Add New Theme'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create a new wedding invitation theme for your platform.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>Save as Draft</span>
          </button>

          {currentStep === 5 ? (
            <button
              type="button"
              onClick={handleFinalPublish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Publish Theme</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
          <button onClick={() => setFormError('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 5-Step Stepper Progress Bar (Exact Match to Screenshot) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto relative">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />

          {steps.map((st) => {
            const isCompleted = currentStep > st.number;
            const isCurrent = currentStep === st.number;

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => setCurrentStep(st.number)}
                className="flex flex-col items-center group relative z-10 focus:outline-none"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#8B1D3B] text-white ring-4 ring-[#8B1D3B]/15 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : st.number}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium tracking-tight whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#8B1D3B] font-bold'
                      : isCompleted
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {st.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STEP 1: BASIC DETAILS
         ======================================================== */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs">
          {/* Left Column: Theme Information */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Theme Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Theme Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Palace, Floral Bliss"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Theme Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                placeholder="e.g. royal-palace"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Used in URL. Only lowercase letters, numbers and hyphens.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">Description</label>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <span className="font-bold hover:text-gray-700 cursor-pointer">B</span>
                  <span className="italic hover:text-gray-700 cursor-pointer">I</span>
                  <span className="underline hover:text-gray-700 cursor-pointer">U</span>
                </div>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the theme, its style, and what makes it special..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <div className="text-right text-[10px] text-gray-400 mt-0.5">
                {formData.description.length}/500 characters
              </div>
            </div>
          </div>

          {/* Right Column: Theme Configuration */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Theme Configuration
            </h3>

            {/* Theme Type Radio Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Theme Type</label>
              <div className="space-y-2">
                {[
                  { id: 'video', label: 'Video Invitation' },
                  { id: 'website', label: 'Website Invitation' },
                  { id: 'both', label: 'Both (Video + Website)' },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      formData.themeType === type.id
                        ? 'border-[#8B1D3B] bg-[#8B1D3B]/5 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="themeType"
                      checked={formData.themeType === type.id}
                      onChange={() => setFormData({ ...formData, themeType: type.id })}
                      className="text-[#8B1D3B] focus:ring-[#8B1D3B]"
                    />
                    <span className="text-xs font-semibold">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Dropdown & Quick Create */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalError('');
                    setIsNewCategoryModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1D3B] hover:text-[#70162e] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Category</span>
                </button>
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              >
                {effectiveCategories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Style / Theme Chips */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Style / Theme</label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = formData.tags.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleTag(style)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#8B1D3B] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Support */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Language Support
              </label>
              <div className="flex items-center gap-4">
                {['English', 'Hindi', 'Other'].map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                      className="rounded border-gray-300 text-[#8B1D3B] focus:ring-[#8B1D3B]"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: MEDIA & TEMPLATES
         ======================================================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs">
            {/* Video Files (Demo / Preview) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Video Files (Demo/Preview)</h3>

              <div className="border-2 border-dashed border-rose-200/80 rounded-2xl p-6 text-center bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#8B1D3B] flex items-center justify-center mx-auto mb-3">
                  <Film className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">Upload Preview Video</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">MP4, MOV (Max 100MB)</p>

                <div className="mt-4 flex flex-col items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-2xs">
                    <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <div className="w-full mt-2">
                    <span className="text-[10px] text-gray-400 block mb-1">Or paste video URL:</span>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://example.com/demo.mp4"
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-gray-50 border border-gray-200 text-gray-800"
                    />
                  </div>
                </div>

                {formData.videoUrl && (
                  <div className="mt-3 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center justify-between">
                    <span className="truncate max-w-[200px]">Video loaded: {formData.videoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrl: '' })}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Image (Cover) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Thumbnail Image</h3>

              <div className="border-2 border-dashed border-rose-200/80 rounded-2xl p-6 text-center bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#8B1D3B] flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">Upload Thumbnail</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  JPG, PNG, WebP (Recommended: 1080x1920)
                </p>

                <div className="mt-4 flex flex-col items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-2xs">
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  <div className="w-full mt-2">
                    <span className="text-[10px] text-gray-400 block mb-1">Or paste image URL:</span>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-gray-50 border border-gray-200 text-gray-800"
                    />
                  </div>
                </div>

                {formData.coverImage && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200 text-left">
                    <img
                      src={formData.coverImage}
                      alt="Thumbnail Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        Thumbnail Ready
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate font-mono">
                        {formData.coverImage}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Template Files (For Generation) & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">
                Template Files (For Generation)
              </h3>
              <p className="text-xs text-gray-500">
                Upload the base template files used for automatic video and website generation.
              </p>

              {formData.templateFile?.filename ? (
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#8B1D3B]/10 text-[#8B1D3B] flex items-center justify-center">
                      <FileArchive className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {formData.templateFile.filename}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {(formData.templateFile.size / (1024 * 1024)).toFixed(1)} MB - Uploaded
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        templateFile: { url: '', filename: '', size: 0, uploadedAt: null },
                      })
                    }
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-[#8B1D3B]">Choose template ZIP</span>
                  <input
                    type="file"
                    accept=".zip,application/zip"
                    onChange={handleTemplateUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Template Guidelines */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-xs text-gray-600">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#8B1D3B]" />
                <span>Template Guidelines</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>Use high-quality video templates (1080p minimum).</li>
                <li>Keep text placeholders clearly labeled matching Step 3 keys.</li>
                <li>Provide separate layers if required for personalized overlays.</li>
                <li>Recommended duration: 20–60 seconds.</li>
                <li>Use standard fonts or embed required typography.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: CUSTOMIZATION FIELDS & PLACEHOLDERS
         ======================================================== */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs">
          {/* Left Column: Editable Fields */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Editable Fields</h3>
              <p className="text-xs text-gray-500">
                Add fields that customers can personalize in the invitation suite.
              </p>
            </div>

            <div className="space-y-2">
              {formData.customizationFields.map((field, idx) => (
                <div
                  key={field.key || idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {field.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {`{${field.key}}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-gray-200 text-gray-700 capitalize">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Required
                      </span>
                    )}
                    {idx >= 4 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Field Inline Trigger */}
            {!isAddFieldOpen ? (
              <button
                type="button"
                onClick={() => setIsAddFieldOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#8B1D3B]/40 text-[#8B1D3B] text-xs font-bold hover:bg-rose-50/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Field</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                <h4 className="text-xs font-bold text-gray-900">Configure New Field</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Host Name)"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white border border-gray-200"
                  />
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white border border-gray-200"
                  >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                    <option value="image">Image</option>
                    <option value="repeater">Repeater</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      className="rounded text-[#8B1D3B]"
                    />
                    <span>Required Field</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddFieldOpen(false)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewField}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#8B1D3B] text-white hover:bg-[#6E142C]"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview & Placeholders */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Preview & Placeholders</h3>
              <p className="text-xs text-gray-500">
                Visual card simulation and available interpolation placeholders.
              </p>
            </div>

            {/* Mobile Card Preview Simulation */}
            <div className="relative mx-auto w-64 h-80 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md flex flex-col justify-end p-4 text-center text-white">
              <img
                src={formData.coverImage || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80'}
                alt="Theme Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                  Together With Their Families
                </span>
                <div className="font-serif text-lg font-bold text-white leading-tight">
                  {'{BrideName}'} & {'{GroomName}'}
                </div>
                <div className="text-[10px] text-rose-100 font-medium">
                  {'{WeddingDate}'} • {'{Venue}'}
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[9px] bg-white/20 backdrop-blur-xs text-white border border-white/30">
                    ShaadiVibe Royal Suite
                  </span>
                </div>
              </div>
            </div>

            {/* Available Placeholders Panel */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-900 block">
                Available Placeholders
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {[
                  '{BrideName}',
                  '{GroomName}',
                  '{WeddingDate}',
                  '{Venue}',
                  '{FamilyText}',
                  '{Photo1}',
                  '{Photo2}',
                  '{Function1}',
                ].map((ph) => (
                  <span
                    key={ph}
                    className="px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 shadow-2xs"
                  >
                    {ph}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Use these placeholders in your template files and personalized invitation fields.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: PRICING & SETTINGS
         ======================================================== */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs">
          {/* Left Column: Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Pricing Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Regular Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priceDisplay}
                  onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                  placeholder="1999"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Offer Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                  placeholder="1499"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Leave empty if no offer</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Package</label>
              <select
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              >
                <option value="Video + Website">Video + Website</option>
                <option value="Video Only">Video Only</option>
                <option value="Website Only">Website Only</option>
                <option value="Royal Collection">Royal Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Hosting Duration (Months) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.hostingDurationMonths}
                onChange={(e) => setFormData({ ...formData, hostingDurationMonths: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                For website themes. Video files are downloadable.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Max Functions Allowed <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.maxFunctions}
                onChange={(e) => setFormData({ ...formData, maxFunctions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Number of wedding events/functions allowed.
              </span>
            </div>
          </div>

          {/* Right Column: Other Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Other Settings
            </h3>

            {/* Status Radio Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                    className="text-[#8B1D3B]"
                  />
                  <span className="font-semibold text-emerald-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'draft'}
                    onChange={() => setFormData({ ...formData, status: 'draft' })}
                    className="text-[#8B1D3B]"
                  />
                  <span className="font-semibold text-gray-500">Inactive / Draft</span>
                </label>
              </div>
            </div>

            {/* Featured Theme Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Featured Theme</span>
                <span className="text-[10px] text-gray-500 block">Show this theme on homepage</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B1D3B]" />
              </label>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Lower numbers appear first.</span>
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">SEO Title</label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Royal Palace Wedding Invitation | ShaadiVibe"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Used for search engines and social sharing.</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: PREVIEW & PUBLISH
         ======================================================== */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Theme Summary & Final Verification</h3>
              <p className="text-xs text-gray-500">
                Review all configured theme details, assets, and pricing before publishing.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                formData.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {formData.status === 'active' ? 'Ready to Publish' : 'Saving as Draft'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Thumbnail */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 relative aspect-[4/3] bg-gray-100">
              <img
                src={formData.coverImage || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a'}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                {formData.category}
              </div>
            </div>

            {/* Config Specs */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Theme Name:</span>
                <span className="font-bold text-gray-900 text-sm">{formData.name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">URL Slug:</span>
                <span className="font-mono text-gray-800">/themes/{formData.slug}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Pricing:</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900 text-sm">₹{formData.priceDisplay}</span>
                  {formData.offerPrice > 0 && (
                    <span className="text-emerald-600 font-bold ml-2">
                      (Offer: ₹{formData.offerPrice})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Theme Type & Package:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {formData.themeType} ({formData.package})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Configured Fields:</span>
                <span className="font-semibold text-gray-800">
                  {formData.customizationFields.length} personalization fields
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500 font-medium">Video & Template:</span>
                <span className="font-semibold text-gray-800">
                  {formData.videoUrl ? 'Video Linked' : 'No Video'} •{' '}
                  {formData.templateFile?.filename ? formData.templateFile.filename : 'No Template ZIP'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BOTTOM STEP CONTROLS (Back / Save Draft / Next)
         ======================================================== */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) setCurrentStep((prev) => prev - 1);
            else if (onCancel) onCancel();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-gray-500" />
            <span>Save as Draft</span>
          </button>

          {currentStep === 5 ? (
            <button
              type="button"
              onClick={handleFinalPublish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Publish Theme</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Quick-Create Category Modal */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#8B1D3B] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Add New Category</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewCategoryModalOpen(false);
                  setCategoryModalError('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {categoryModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{categoryModalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Punjabi Sangeet, Boho Chic"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category theme collection..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]/20 focus:border-[#8B1D3B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCategoryModalOpen(false);
                    setCategoryModalError('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1D3B] text-white text-xs font-bold hover:bg-[#6E142C] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCreatingCategory ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Create & Select</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
