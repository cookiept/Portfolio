import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada projeto é um ficheiro .md em src/content/projects/
// As imagens de capa vão para src/assets/projects/
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => {
    const shot = z.object({ src: image(), alt: z.string(), label: z.string().optional() });

    // Blocos do case study, pela ordem em que aparecem na página
    const block = z.discriminatedUnion('type', [
      // Texto: título da secção + parágrafos (markdown simples não é preciso)
      z.object({ type: z.literal('text'), eyebrow: z.string().optional(), title: z.string(), body: z.array(z.string()) }),
      // Uma imagem grande com legenda
      z.object({ type: z.literal('figure'), image: shot, caption: z.string().optional(), note: z.string().optional() }),
      // Grelha de ecrãs (2 ou 3 colunas)
      z.object({ type: z.literal('grid'), columns: z.union([z.literal(2), z.literal(3)]).default(2), images: z.array(shot), caption: z.string().optional(), note: z.string().optional() }),
      // Páginas compridas lado a lado (scroll horizontal no telemóvel)
      z.object({ type: z.literal('tall'), images: z.array(shot), caption: z.string().optional(), note: z.string().optional() }),
      // Passos numerados
      z.object({ type: z.literal('steps'), title: z.string(), steps: z.array(z.object({ title: z.string(), text: z.string() })) }),
      // Sistema visual: cores e tipos de letra
      z.object({
        type: z.literal('system'),
        eyebrow: z.string().optional(),
        title: z.string(),
        lede: z.string().optional(),
        colors: z.array(z.object({ name: z.string(), hex: z.string() })),
        fonts: z.array(z.object({ name: z.string(), role: z.string(), family: z.string(), weight: z.number().default(400), italic: z.boolean().default(false), sample: z.string() })),
      }),
    ]);

    return z.object({
      title: z.string(),
      summary: z.string(),
      kind: z.enum(['app', 'web']), // define o tipo de imagem provisória
      order: z.number(),
      cover: image().optional(),
      // Projeto ainda sem informação: aparece como "em breve" e sem link
      placeholder: z.boolean().default(false),
      // Case study completo (opcional: sem isto a página mostra só o resumo)
      facts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      blocks: z.array(block).optional(),
    });
  },
});

export const collections = { projects };
