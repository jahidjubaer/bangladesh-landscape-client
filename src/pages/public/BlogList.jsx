import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PenLine, BadgeCheck, MapPin } from 'lucide-react';
import { useBlogs } from '../../features/blogs/queries';
import { useDistricts } from '../../features/districts/queries';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t, lx, locale } from '../../i18n';

function BlogCard({ b, featured = false }) {
  return (
    <Link
      to={`/blog/${b.slug}`}
      className={`card bg-base-100 shadow-md card-lift img-zoom block h-full ${featured ? 'md:card-side' : ''}`}
    >
      <figure className={featured ? 'md:w-1/2 h-56 md:h-auto' : 'h-44'}>
        <Img src={b.coverImageUrl} alt={lx(b.title)} icon={PenLine} className="w-full h-full object-cover" />
      </figure>
      <div className={`card-body p-5 ${featured ? 'md:w-1/2 justify-center' : ''}`}>
        <h2 className={`card-title leading-snug ${featured ? 'font-display text-2xl md:text-3xl' : 'text-base'}`}>
          {lx(b.title)}
          {b.hasBadge && (
            <span className="badge badge-primary badge-sm gap-1">
              <BadgeCheck className="w-3 h-3" /> {t('blog.officialBadge')}
            </span>
          )}
        </h2>
        <p className={`text-base-content/65 ${featured ? 'line-clamp-4' : 'text-sm line-clamp-3'}`}>{b.excerpt}</p>
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-base-content/50 mt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
              {b.author?.name?.charAt(0)}
            </span>
            {b.author?.name}
          </span>
          <span className="flex items-center gap-1">
            {lx(b.district?.name) && (
              <>
                <MapPin className="w-3 h-3" /> {lx(b.district.name)} ·
              </>
            )}
            {new Date(b.publishedAt).toLocaleDateString(locale())}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogList() {
  const [district, setDistrict] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data: districts } = useDistricts();
  const { data, isLoading } = useBlogs({ district, q, page });

  function submitSearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(search);
  }

  const blogs = data?.blogs || [];
  const showFeatured = page === 1 && !q && !district && blogs.length > 0;
  const featured = showFeatured ? blogs[0] : null;
  const rest = showFeatured ? blogs.slice(1) : blogs;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('blog.listTitle')} description={t('blog.listSubtitle')} />
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{t('blog.listTitle')}</h1>
            <p className="text-base-content/60">{t('blog.listSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <form onSubmit={submitSearch} className="join">
              <input
                className="input input-bordered input-sm join-item"
                placeholder={t('blog.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" aria-label="search" className="btn btn-sm btn-primary join-item">
                <Search className="w-4 h-4" />
              </button>
            </form>
            <select
              className="select select-bordered select-sm"
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
            >
              <option value="">{t('blog.allDistricts')}</option>
              {(districts || []).map((d) => (
                <option key={d.slug} value={d.slug}>{lx(d.name)}</option>
              ))}
            </select>
            <Link to="/write-blog" className="btn btn-secondary btn-sm rounded-full gap-1.5">
              <PenLine className="w-4 h-4" /> {t('blog.writeBlog')}
            </Link>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : !blogs.length ? (
        <EmptyState
          icon={PenLine}
          title={t('blog.noBlogs')}
          actionLabel={t('blog.writeBlog')}
          actionTo="/write-blog"
        />
      ) : (
        <>
          {featured && (
            <Reveal className="mb-8">
              <BlogCard b={featured} featured />
            </Reveal>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((b, i) => (
              <Reveal key={b.slug} delay={(i % 3) * 0.08}>
                <BlogCard b={b} />
              </Reveal>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="join flex justify-center mt-10">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-primary' : ''}`} onClick={() => setPage(p)}>
                  {Number(p).toLocaleString(locale())}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
