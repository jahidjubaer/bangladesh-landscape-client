// Data saver: no autoplaying photo montages or looping animations.
// Defaults to the browser's Save-Data hint until the visitor chooses.
const KEY = 'bl-data-saver';

export function isDataSaver() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* private mode */
  }
  return Boolean(typeof navigator !== 'undefined' && navigator.connection?.saveData);
}

export function applyDataSaver(on = isDataSaver()) {
  document.documentElement.classList.toggle('data-saver', on);
  return on;
}

export function setDataSaver(on) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
  applyDataSaver(on);
  window.dispatchEvent(new CustomEvent('bl:data-saver', { detail: on }));
}
