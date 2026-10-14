// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
// Publicado no GitHub Pages em https://cookiept.github.io/Portfolio/
// Se mais tarde usares um domínio próprio: muda `site` e remove `base`.
export default defineConfig({
  site: 'https://cookiept.github.io',
  base: '/Portfolio',
  output: 'static',
});
