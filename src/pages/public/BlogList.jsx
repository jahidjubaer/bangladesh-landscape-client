import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogs } from '../../features/blogs/queries';
import { useDistricts } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import Seo from '../../components/Seo';
import { t } from '../../i18n';

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Seo title={t('blog.listTitle')} description={t('blog.listSubtitle')} />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t('blog.listTitle')}</h1>
          <p className="text-base-content/70">{t('blog.listSubtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <form onSubmit={submitSearch} className="join">
            <input
              className="input input-bordered input-sm join-item"
              placeholder={t('blog.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary join-item">🔍</button>
          </form>
          <select
            className="select select-bordered select-sm"
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
          >
            <option value="">{t('blog.allDistricts')}</option>
            {(districts || []).map((d) => (
              <option key={d.slug} value={d.slug}>{d.name.bn}</option>
            ))}
          </select>
          <Link to="/write-blog" className="btn btn-secondary btn-sm">✍️ {t('blog.writeBlog')}</Link>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : !data?.blogs?.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-base-content/70 mb-6">{t('blog.noBlogs')}</p>
          <Link to="/write-blog" className="btn btn-primary">✍️ {t('blog.writeBlog')}</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.blogs.map((b) => (
              <Link key={b.slug} to={`/blog/${b.slug}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <figure className="h-44 bg-gradient-to-br from-secondary/20 to-primary/20">
                  {b.coverImageUrl ? (
                    <img src={b.coverImageUrl} alt={b.title.bn} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-5xl">📝</span>
                  )}
                </figure>
                <div className="card-body p-5">
                  <h2 className="card-title text-base leading-snug">
                    {b.title.bn}
                    {b.hasBadge && <span className="badge badge-primary badge-sm">✓ {t('blog.officialBadge')}</span>}
                  </h2>
                  <p className="text-sm text-base-content/70 line-clamp-3">{b.excerpt}</p>
                  <div className="flex justify-between items-center text-xs text-base-content/50 mt-2">
                    <span>✍️ {b.author?.name}</span>
                    <span>
                      {b.district?.name?.bn && `📍 ${b.district.name.bn} · `}
                      {new Date(b.publishedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="join flex justify-center mt-8">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-primary' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
