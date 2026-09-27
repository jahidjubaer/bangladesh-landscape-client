const SITE = 'বাংলাদেশ ল্যান্ডস্কেপ';

// Absolute URL — scrapers and schema.org reject relative ones
export function absUrl(u) {
  if (!u) return undefined;
  return u.startsWith('http') ? u : window.location.origin + u;
}

// React 19 hoists <title>, <meta> and <link> from anywhere in the tree
// into <head>. JSON-LD script tags may stay in the body — Google reads
// them wherever they are.
export default function Seo({ title, description, image, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — জেলাভিত্তিক ভ্রমণ গাইড`;
  const desc = description ? String(description).slice(0, 160) : undefined;
  const url = window.location.origin + window.location.pathname;
  const img = absUrl(image) || absUrl('/og-cover.png');
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...block }) }}
        />
      ))}
    </>
  );
}
