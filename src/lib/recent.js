const KEY = 'bl-recent';
const MAX = 8;

// Remember detail pages the visitor opened — shown as a strip on home.
export function recordView(entry) {
  try {
    const list = getRecent().filter((e) => e.link !== entry.link);
    list.unshift({ ...entry, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* private mode */
  }
}

export function getRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
