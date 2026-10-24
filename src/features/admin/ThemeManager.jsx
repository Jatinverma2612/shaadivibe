import React, { useState, useEffect } from 'react';
import { fetchThemes, createTheme, updateTheme, toggleThemePublish } from '../../services/api.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input, Textarea } from '../../components/common/Input.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const ThemeManager = () => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Royal',
    description: '',
    coverImage: '',
    priceDisplay: 2499,
    supportedFormats: ['Interactive Website'],
    features: '3D Envelope Unwrapping, Multi-day Itinerary, Live Countdown',
  });

  const loadAllThemes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchThemes({ all: 'true' });
      setThemes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch themes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllThemes();
  }, []);

  const openCreateModal = () => {
    setEditingTheme(null);
    setFormData({
      name: '',
      slug: '',
      category: 'Royal',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      priceDisplay: 2499,
      supportedFormats: ['Interactive Website'],
      features: '3D Envelope Unwrapping, Multi-day Ceremony Itinerary, Auspicious Countdown',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      slug: theme.slug,
      category: theme.category,
      description: theme.description,
      coverImage: theme.coverImage,
      priceDisplay: theme.priceDisplay || 0,
      supportedFormats: theme.supportedFormats || ['Interactive Website'],
      features: Array.isArray(theme.features) ? theme.features.join(', ') : '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      await toggleThemePublish(id);
      loadAllThemes();
    } catch (err) {
      alert(`Could not toggle publication: ${err.message}`);
    }
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.coverImage.trim()) {
      setModalError('Theme Name and Cover Image are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    const payload = {
      ...formData,
      features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      priceDisplay: Number(formData.priceDisplay) || 0,
    };

    try {
      if (editingTheme) {
        await updateTheme(editingTheme._id || editingTheme.id, payload);
      } else {
        await createTheme(payload);
      }
      setIsModalOpen(false);
      loadAllThemes();
    } catch (err) {
      setModalError(err.message || 'Failed to save theme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-royal-maroon-800">
            Theme Management Registry
          </h2>
          <p className="text-xs text-royal-brown-600 mt-0.5">
            Create, configure, publish, or modify royal wedding themes displayed on the public gallery.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Theme
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-royal-gold-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-royal-brown-600">Loading themes...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadAllThemes}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="bg-royal-ivory-card border border-royal-gold-400/40 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-royal-brown-800">
              <thead className="bg-royal-ivory-warm border-b border-royal-gold-300 text-royal-brown-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Cover</th>
                  <th className="py-3 px-4">Theme Name & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supported Formats</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold-300/30">
                {themes.map((t) => (
                  <tr key={t.slug || t._id || t.id} className="hover:bg-royal-gold-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-royal-ivory-warm border border-royal-gold-300">
                        <img src={t.coverImage} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="font-serif text-sm font-bold text-royal-maroon-800 block">
                        {t.name}
                      </strong>
                      <span className="text-[10px] text-royal-brown-500 font-mono">
                        /themes/{t.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="gold" size="sm">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.supportedFormats?.map((fmt, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-royal-gold-100 text-royal-gold-900 px-1.5 py-0.5 rounded font-medium"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-royal-maroon-800">
                      ₹{t.priceDisplay}
                    </td>
                    <td className="py-3 px-4">
                      {t.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <XCircle className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(t._id || t.id)}
                          title={t.isPublished ? 'Unpublish Theme' : 'Publish Theme'}
                          className="text-[11px]"
                        >
                          {t.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(t)}
                          className="text-[11px]"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Theme Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTheme ? 'Edit Royal Theme' : 'Create New Royal Theme'}
        subtitle="Theme Registry & Customization Options"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveTheme} className="space-y-4 text-left">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Theme Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Royal Udaipur Palace"
            />
            <Input
              label="Slug (Optional, auto-generated)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. royal-udaipur-palace"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-royal-brown-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-royal-ivory-card border border-royal-gold-500/40 text-royal-brown-900 text-sm focus:outline-none focus:border-royal-gold-600"
              >
                {['Royal', 'Traditional', 'Floral', 'Minimal', 'Modern', 'Destination', 'Regional'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Display Price (INR)"
              type="number"
              value={formData.priceDisplay}
              onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
              placeholder="2499"
            />
          </div>

          <Input
            label="Cover Image URL"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            required
            placeholder="https://images.unsplash.com/..."
          />

          <Textarea
            label="Theme Description"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Regal aesthetics featuring Lake Pichola arches and gold foil..."
          />

          <Input
            label="Features (comma-separated)"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="3D Envelope, Multi-day Itinerary, Live Countdown, Interactive Cards"
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" isLoading={isSubmitting}>
              {editingTheme ? 'Update Theme' : 'Create Theme'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
