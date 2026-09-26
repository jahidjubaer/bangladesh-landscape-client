// React 19 hoists <title> and <meta> from anywhere in the tree into <head>
export default function Seo({ title, description, image }) {
  const fullTitle = title ? `${title} — বাংলাদেশ ল্যান্ডস্কেপ` : 'বাংলাদেশ ল্যান্ডস্কেপ';
  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description.slice(0, 160)} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description.slice(0, 160)} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="article" />
    </>
  );
}
