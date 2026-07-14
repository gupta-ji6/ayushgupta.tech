import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const booleanFlag = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');
const optionalUrl = z.url().optional();
const optionalLooseImageField = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value : undefined));

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/index.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      draft: z.boolean(),
      slug: z.string(),
      cover: image(),
      popular: z.boolean().default(false),
      tags: z.array(z.string()),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/index.md' }),
  schema: ({ image }) =>
    z.object({
      date: z.string(),
      title: z.string(),
      image: optionalLooseImageField,
      cover: image().optional(),
      github: optionalUrl,
      external: optionalUrl,
      googleplay: optionalUrl,
      appstore: optionalUrl,
      tech: z.array(z.string()),
      show: booleanFlag,
    }),
});

const featured = defineCollection({
  loader: glob({ base: './src/content/featured', pattern: '**/index.md' }),
  schema: ({ image }) =>
    z.object({
      date: z.string(),
      title: z.string(),
      cover: image(),
      github: optionalUrl,
      external: optionalUrl,
      googleplay: optionalUrl,
      appstore: optionalUrl,
      tech: z.array(z.string()),
      show: booleanFlag,
    }),
});

const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '**/index.md' }),
  schema: z.object({
    date: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    range: z.string(),
    url: z.url(),
    show: booleanFlag,
  }),
});

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/index.md' }),
  schema: z.object({
    level: z.string(),
    school: z.string(),
    location: z.string(),
    passingYear: z.string(),
    url: z.url(),
  }),
});

const uses = defineCollection({
  loader: glob({ base: './src/content/uses', pattern: '**/index.md' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    order: z.number(),
  }),
});

const about = defineCollection({
  loader: glob({ base: './src/content/about', pattern: '*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      avatar: image(),
      skills: z.array(z.string()),
    }),
});

const hero = defineCollection({
  loader: glob({ base: './src/content/hero', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    subtitle: z.string(),
    contactText: z.string(),
  }),
});

const contact = defineCollection({
  loader: glob({ base: './src/content/contact', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
  }),
});

const funFacts = defineCollection({
  loader: glob({ base: './src/content/funFacts', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  blog,
  projects,
  featured,
  jobs,
  education,
  uses,
  about,
  hero,
  contact,
  funFacts,
};
