import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Image with a branded placeholder when src is missing or fails to load.
export default function Img({ src, alt = '', className = '', icon: Icon, ...props }) {
  const [failed, setFailed] = useState(false);
  const Fallback = Icon || ImageOff;

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 text-primary/40 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Fallback className="w-10 h-10" strokeWidth={1.5} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} {...props} />;
}
