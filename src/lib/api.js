// Small fetch client with the call shape the app already uses:
//   const res = await api.get('/spots', { params: { season } });  res.data
//   catch (err) { err.response?.data?.message }
// Same-origin in dev via the Vite proxy; set VITE_API_URL in production.
const BASE = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'ApiError';
    this.response = response; // { status, data, headers } or undefined on network failure
    this.isApiError = true;
  }
}

function buildUrl(path, params) {
  let url = /^https?:\/\//.test(path) ? path : BASE + path;
  if (params) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) value.forEach((v) => qs.append(`${key}[]`, v));
      else qs.append(key, value instanceof Date ? value.toISOString() : value);
    }
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }
  return url;
}

async function readBody(res, responseType) {
  if (res.status === 204) return null;
  if (responseType === 'blob') return res.blob();
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, path, body, config = {}) {
  const { params, responseType, headers = {}, signal } = config;
  const init = { method, credentials: 'include', headers: { Accept: 'application/json', ...headers }, signal };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
      init.body = body; // the browser sets the multipart boundary
    } else {
      init.body = JSON.stringify(body);
      init.headers['Content-Type'] = 'application/json';
    }
  }

  let res;
  try {
    res = await fetch(buildUrl(path, params), init);
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(err?.message || 'Network Error', undefined);
  }

  // Error bodies are JSON even when the caller asked for a blob
  const data = await readBody(res, res.ok ? responseType : undefined).catch(() => null);
  const response = { status: res.status, data, headers: res.headers };
  if (!res.ok) throw new ApiError(`Request failed with status code ${res.status}`, response);
  return response;
}

const api = {
  get: (path, config) => request('GET', path, undefined, config),
  delete: (path, config) => request('DELETE', path, undefined, config),
  post: (path, body, config) => request('POST', path, body, config),
  put: (path, body, config) => request('PUT', path, body, config),
  patch: (path, body, config) => request('PATCH', path, body, config),
};

export default api;
