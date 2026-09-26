import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, BadgeCheck, CalendarDays, Eye, MapPin } from 'lucide-react';
import { useBlog } from '../../features/blogs/queries';
import Loader from '../../components/Loader';
import Seo from '../../components/Seo';
import NotFound from '../NotFound';
import { t } from '../../i18n';

export default function BlogDetail() {
  const { slug } = useParams();
  const { data: blog, isLoading, isError } = useBlog(slug);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  if (isLoading) return <Loader fullScreen />;
  if (isError || !blog) return <NotFound />;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary origin-left z-40"
        style={{ scaleX: progress }}
        aria-hidden
      />
      <Seo title={blog.title.bn} description={blog.excerpt} image={blog.coverImageUrl} />

      {blog.coverImageUrl && (
        <img src={blog.coverImageUrl} alt={blog.title.bn} className="w-full h-72 object-cover rounded-2xl shadow-md mb-6" />
      )}

      <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight mb-4 flex items-start gap-2 flex-wrap">
        {blog.title.bn}
        {blog.hasBadge && (
          <span className="badge badge-primary mt-2 gap-1">
            <BadgeCheck className="w-3.5 h-3.5" /> {t('blog.officialBadge')}
          </span>
        )}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 border-b border-base-200 pb-5 mb-8">
        <span className="flex items-center gap-2 font-medium text-base-content/80">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content font-bold inline-flex items-center justify-center">
            {blog.author?.name?.charAt(0)}
          </span>
          {blog.author?.name}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" /> {new Date(blog.publishedAt).toLocaleDateString('bn-BD')}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> {Number(blog.views).toLocaleString('bn-BD')} {t('blog.views')}
        </span>
        {blog.district && (
          <Link to={`/districts/${blog.district.slug}`} className="badge badge-outline badge-primary gap-1">
            <MapPin className="w-3 h-3" /> {blog.district.name?.bn}
          </Link>
        )}
      </div>

      {/* Server-sanitized HTML (sanitize-html allowlist) */}
      <div
        className="prose prose-lg max-w-none leading-loose [&_img]:rounded-xl"
        dangerouslySetInnerHTML={{ __html: blog.content.bn }}
      />

      <div className="mt-10 pt-6 border-t border-base-200 text-center">
        <Link to="/blog" className="btn btn-outline btn-sm rounded-full gap-1.5">
          <ArrowLeft className="w-4 h-4" /> {t('blog.listTitle')}
        </Link>
      </div>
    </article>
  );
}
