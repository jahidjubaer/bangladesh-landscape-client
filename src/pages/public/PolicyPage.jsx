import { useParams, Link } from 'react-router-dom';
import policies from '../../content/policies';
import Seo from '../../components/Seo';
import NotFound from '../NotFound';

const TYPES = Object.keys(policies);

export default function PolicyPage() {
  const { type } = useParams();
  const policy = policies[type];
  if (!policy) return <NotFound />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Seo title={policy.title} description={`বাংলাদেশ ল্যান্ডস্কেপ — ${policy.title}`} />

      <div className="tabs tabs-boxed w-fit mb-6 flex-wrap">
        {TYPES.map((k) => (
          <Link key={k} to={`/policies/${k}`} className={`tab ${k === type ? 'tab-active' : ''}`}>
            {policies[k].title.split(' ')[0]}
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-1">{policy.title}</h1>
      <p className="text-sm text-base-content/50 mb-8">সর্বশেষ হালনাগাদ: {policy.updated}</p>

      <div className="space-y-6">
        {policy.sections.map((s) => (
          <section key={s.heading} className="card bg-base-100 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-lg text-primary">{s.heading}</h2>
              <ul className="list-disc ms-5 space-y-2 leading-relaxed text-base-content/85">
                {s.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
