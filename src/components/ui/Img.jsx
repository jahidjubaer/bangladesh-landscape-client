import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import Scene from './Scene';
import { sceneForText } from '../../lib/scenes';

// Image with a shimmer placeholder while loading and an illustrated
// landscape fallback when src is missing or fails to load.
// `scene` picks the illustration; otherwise it is derived from the alt text.
export default function Img({ src, alt = '', className = '', icon: Icon, scene, ...props }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const Fallback = Icon || ImageOff;

  if (!src || failed) {
    return (
      <div
        className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative '}overflow-hidden bg-base-300 ${className}`}
        // Empty alt = decorative, same as an <img alt="">
        {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      >
        <Scene type={scene || sceneForText(alt)} className="absolute inset-0 w-full h-full" />
        <span className="absolute left-3 bottom-3 grid place-items-center w-8 h-8 rounded-full bg-black/25 backdrop-blur-sm text-white/90">
          <Fallback className="w-4 h-4" strokeWidth={2} aria-hidden />
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? '' : 'img-loading'}`}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
