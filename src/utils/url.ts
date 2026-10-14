// Junta o caminho base do site (ex.: /Portfolio no GitHub Pages) a um link interno.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path = '/'): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
