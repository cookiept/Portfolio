// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://docs.astro.build/en/reference/configuration-reference/
// Publicado no GitHub Pages em https://cookiept.github.io/Portfolio/
// Se mais tarde usares um domínio próprio: muda `site` e remove `base`.
export default defineConfig({
  site: 'https://cookiept.github.io',
  base: '/Portfolio',
  output: 'static',
  // React só para os efeitos interativos (fundo líquido e brilho especular)
  integrations: [react()],
});
