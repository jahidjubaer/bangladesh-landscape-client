import { useId, useMemo } from 'react';
import { sceneMarkup } from '../../lib/scenes';

// Illustrated landscape that fills its parent (position it with className).
// Decorative by default; pass `label` to expose it as an image.
export default function Scene({ type = 'haor', className = '', label }) {
  const rid = useId();
  const id = `sc${rid.replace(/[^a-zA-Z0-9]/g, '')}`;
  const html = useMemo(() => sceneMarkup(type, id), [type, id]);
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
