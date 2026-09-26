import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../../features/blogs/queries';
import Loader from '../../components/Loader';
import Seo from '../../components/Seo';
import NotFound from '../NotFound';
import { t } from '../../i18n';

export default function BlogDetail() {
  const { slug } = useParams();
  const { data: blog, isLoading, isError } = useBlog(slug);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !blog) return <NotFound />;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Seo title={blog.title.bn} description={blog.excerpt} image={blog.coverImageUrl} />

      {blog.coverImageUrl && (
        <img src={blog.coverImageUrl} alt={blog.title.bn} className="w-full h-72 object-cover rounded-2xl shadow-md mb-6" />
      )}

      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3 flex items-start gap-2 flex-wrap">
        {blog.title.bn}
        {blog.hasBadge && <span className="badge badge-primary mt-2">✓ {t('blog.officialBadge')}</span>}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/60 border-b border-base-200 pb-4 mb-6">
        <span className="flex items-center gap-2">
          <span className="avatar placeholder">
            <span className="bg-primary text-primary-content rounded-full w-7 inline-flex items-center justify-center">
              {blog.author?.name?.charAt(0)}
            </span>
          </span>
          {blog.author?.name}
        </span>
        <span>🗓️ {new Date(blog.publishedAt).toLocaleDateString('bn-BD')}</span>
        <span>👁️ {blog.views} {t('blog.views')}</span>
        {blog.district && (
          <Link to={`/districts/${blog.district.slug}`} className="badge badge-outline badge-primary">
            📍 {blog.district.name?.bn}
          </Link>
        )}
      </div>

      {/* Server-sanitized HTML (sanitize-html allowlist) */}
      <div
        className="prose prose-lg max-w-none leading-loose [&_img]:rounded-xl"
        dangerouslySetInnerHTML={{ __html: blog.content.bn }}
      />

      <div className="mt-10 pt-6 border-t border-base-200 text-center">
        <Link to="/blog" className="btn btn-outline btn-sm">← {t('blog.listTitle')}</Link>
      </div>
    </article>
  );
}
