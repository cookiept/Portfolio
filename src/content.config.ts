import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada projeto é um ficheiro .md em src/content/projects/
// As imagens de capa vão para src/assets/projects/
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      kind: z.enum(['app', 'web']), // define o tipo de imagem provisória
      order: z.number(),
      cover: image().optional(),
      // Projeto ainda sem informação: aparece como "em breve" e sem link
      placeholder: z.boolean().default(false),
    }),
});

export const collections = { projects };
