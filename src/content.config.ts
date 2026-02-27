import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/timeline' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateRange: z.string(),
    order: z.number(),
    logo: z.string().optional(),
    accentColor: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/now' }),
  schema: z.object({
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { journal, timeline, now };
