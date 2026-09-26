import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { useDistricts } from '../../features/districts/queries';
import { useMyBlog, useSaveBlog, uploadBlogImage } from '../../features/blogs/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

export default function BlogEditor() {
  const { id } = useParams(); // undefined = new post
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: districts } = useDistricts();
  const { data: existing, isLoading } = useMyBlog(isEdit ? id : null);
  const save = useSaveBlog();
  const quillRef = useRef(null);

  const [form, setForm] = useState({ titleBn: '', titleEn: '', coverImageUrl: '', districtSlug: '', content: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (existing) {
      const districtSlug = districts?.find((d) => d._id === existing.district)?.slug || '';
      setForm({
        titleBn: existing.title.bn,
        titleEn: existing.title.en || '',
        coverImageUrl: existing.coverImageUrl || '',
        districtSlug,
        content: existing.content.bn,
      });
    }
  }, [existing, districts]);

  // Quill toolbar with image upload through our API
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                const url = await uploadBlogImage(file);
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection(true);
                quill?.insertEmbed(range?.index ?? 0, 'image', url);
              } catch {
                /* upload failed — user can retry */
              }
            };
            input.click();
          },
        },
      },
    }),
    []
  );

  if (authLoading || (isEdit && isLoading)) return <Loader fullScreen />;

  if (!user) {
    return (
      <div className="text-center py-24 px-4">
        <div className="text-6xl mb-4">✍️</div>
        <h1 className="text-2xl font-bold mb-6">{t('blog.loginToWrite')}</h1>
        <Link to="/login" state={{ from: '/write-blog' }} className="btn btn-primary">{t('nav.login')}</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await save.mutateAsync({
        id: isEdit ? id : undefined,
        payload: {
          title: { bn: form.titleBn, en: form.titleEn },
          content: { bn: form.content },
          coverImageUrl: form.coverImageUrl,
          districtSlug: form.districtSlug || undefined,
        },
      });
      setMessage({ type: 'success', text: t('blog.submitted') });
      setTimeout(() => navigate('/my-blogs'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') });
      window.scrollTo(0, 0);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{isEdit ? t('blog.editTitle') : t('blog.editorTitle')}</h1>
      <p className="text-sm text-base-content/60 mb-6">
        {t('blog.guidelines')} {isEdit && t('blog.resubmitNote')}
      </p>

      {message && <div className={`alert alert-${message.type} mb-4`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-4">
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('blog.titleBn')} *</span>
            <input required minLength={5} className="input input-bordered" value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('blog.titleEn')}</span>
            <input className="input input-bordered" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-control">
              <span className="label-text font-semibold mb-1">{t('blog.coverImage')}</span>
              <div className="flex items-center gap-2">
                <input className="input input-bordered input-sm flex-1" placeholder="/uploads/..." value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
                <BlogCoverUploader onUploaded={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))} />
              </div>
              {form.coverImageUrl && <img src={form.coverImageUrl} alt="cover" className="mt-2 h-24 rounded-lg object-cover" />}
            </div>
            <label className="form-control">
              <span className="label-text font-semibold mb-1">{t('blog.district')}</span>
              <select className="select select-bordered select-sm" value={form.districtSlug} onChange={(e) => setForm({ ...form, districtSlug: e.target.value })}>
                <option value="">—</option>
                {(districts || []).map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name.bn}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="label-text font-semibold block mb-1">{t('blog.content')} *</span>
            <div className="bg-base-100 [&_.ql-editor]:min-h-64 [&_.ql-editor]:text-base">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={form.content}
                onChange={(content) => setForm((f) => ({ ...f, content }))}
                modules={modules}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? t('blog.submitting') : `📤 ${t('blog.submit')}`}
          </button>
        </div>
      </form>
    </div>
  );
}

// Same UX as admin ImageUploader but hits the author endpoint
function BlogCoverUploader({ onUploaded }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="btn btn-outline btn-sm">
      {busy ? '...' : '📷'}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            onUploaded(await uploadBlogImage(file));
          } catch {
            /* ignore, user retries */
          } finally {
            setBusy(false);
            e.target.value = '';
          }
        }}
      />
    </label>
  );
}
