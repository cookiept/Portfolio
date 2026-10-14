import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada projeto é um ficheiro .md em src/content/projects/
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    type: z.string(), // ex.: Mobile app, Website
    year: z.number(),
    tags: z.array(z.string()).default([]),
    order: z.number(),
    // Forma do card na landing page
    shape: z.enum(['arch', 'capsule', 'oval', 'leaf', 'drop', 'tilt']),
    // Projeto ainda sem informação: aparece como "em breve" e sem link
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { projects };
