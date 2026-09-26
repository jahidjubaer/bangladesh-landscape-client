import { useState } from 'react';
import api from '../lib/axios';
import { t } from '../i18n';

// Uploads one image to /admin/uploads and calls onUploaded(url)
export default function ImageUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/admin/uploads', form);
      onUploaded(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="btn btn-outline btn-sm">
        {uploading ? t('admin.uploading') : t('admin.uploadImage')}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
      {uploading && <span className="loading loading-spinner loading-sm"></span>}
      {error && <span className="text-error text-sm">{error}</span>}
    </div>
  );
}
