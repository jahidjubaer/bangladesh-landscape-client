import { Link } from 'react-router-dom';
import { useMyBlogs, useDeleteBlog } from '../../features/blogs/queries';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const STATUS_BADGE = { draft: 'badge-ghost', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-error' };

export default function MyBlogs() {
  const { data: blogs, isLoading } = useMyBlogs();
  const del = useDeleteBlog();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('blog.myBlogs')}</h1>
        <Link to="/write-blog" className="btn btn-primary btn-sm">✍️ {t('blog.writeBlog')}</Link>
      </div>

      {!blogs?.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-base-content/70 mb-6">{t('blog.noMyBlogs')}</p>
          <Link to="/write-blog" className="btn btn-primary">{t('blog.writeFirst')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    {b.status === 'approved' ? (
                      <Link to={`/blog/${b.slug}`} className="font-bold link link-hover">{b.title.bn}</Link>
                    ) : (
                      <strong>{b.title.bn}</strong>
                    )}
                    <div className="text-sm text-base-content/60">
                      {b.district?.name?.bn && `📍 ${b.district.name.bn} · `}
                      {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                      {b.status === 'approved' && ` · 👁️ ${b.views} ${t('blog.views')}`}
                    </div>
                    {b.status === 'rejected' && b.moderationNote && (
                      <div className="text-sm text-error mt-1">💬 {t('blog.moderationNote')}: {b.moderationNote}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS_BADGE[b.status]}`}>{t(`blog.status.${b.status}`)}</span>
                    <Link to={`/write-blog/${b._id}`} className="btn btn-xs btn-outline">{t('blog.edit')}</Link>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      disabled={del.isPending}
                      onClick={() => window.confirm(t('admin.confirmDelete')) && del.mutate(b._id)}
                    >
                      {t('blog.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
