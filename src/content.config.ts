import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const requiredText = (field: string) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: `${field} must not be empty`,
  });
const textList = (field: string) =>
  z.array(requiredText(`${field} item`)).min(1, {
    message: `${field} must contain at least one item`,
  });
const httpUrl = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'Expected an HTTP(S) URL');
const optionalUrl = httpUrl.optional();
const optionalLooseImageField = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value : undefined));
const monthPattern =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const jobRangePattern = new RegExp(
  `^(${monthPattern}) (\\d{4}) - (${monthPattern} \\d{4}|Present)$`,
);
const monthIndexes = new Map([
  ['Jan', 0],
  ['January', 0],
  ['Feb', 1],
  ['February', 1],
  ['Mar', 2],
  ['March', 2],
  ['Apr', 3],
  ['April', 3],
  ['May', 4],
  ['Jun', 5],
  ['June', 5],
  ['Jul', 6],
  ['July', 6],
  ['Aug', 7],
  ['August', 7],
  ['Sep', 8],
  ['Sept', 8],
  ['September', 8],
  ['Oct', 9],
  ['October', 9],
  ['Nov', 10],
  ['November', 10],
  ['Dec', 11],
  ['December', 11],
]);
const jobRange = z.string().refine((value) => {
  const match = jobRangePattern.exec(value);
  if (!match) return false;

  const startYear = Number(match[2]);
  if (startYear < 1900) return false;
  if (match[3] === 'Present') return true;

  const endParts = match[3].split(' ');
  const startMonth = monthIndexes.get(match[1]);
  const endMonth = monthIndexes.get(endParts[0]);
  const endYear = Number(endParts[1]);

  if (startMonth === undefined || endMonth === undefined) return false;
  if (startYear < 1900 || endYear < 1900) return false;

  return startYear * 12 + startMonth <= endYear * 12 + endMonth;
}, 'Expected "Mon YYYY - Mon YYYY" or "Mon YYYY - Present" in chronological order');
const blogSlug = z
  .string()
  .regex(/^\/blog\/[^/?#]+$/, 'Expected a single-segment /blog/{slug} path');
const featuredRank = z.coerce.number().int().positive();
const educationYear = z.coerce.number().int().min(1900).max(9999);
const usesOrder = z.number().int().positive();

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/index.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: requiredText('Blog title'),
      description: requiredText('Blog description'),
      date: z.coerce.date(),
      draft: z.boolean(),
      slug: blogSlug,
      cover: image(),
      popular: z.boolean().default(false),
      tags: textList('Blog tags'),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/index.md' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: requiredText('Project title'),
      image: optionalLooseImageField,
      cover: image().optional(),
      github: optionalUrl,
      external: optionalUrl,
      googleplay: optionalUrl,
      appstore: optionalUrl,
      tech: textList('Project technologies'),
      show: z.boolean(),
    }),
});

const featured = defineCollection({
  loader: glob({ base: './src/content/featured', pattern: '**/index.md' }),
  schema: ({ image }) =>
    z.object({
      date: featuredRank,
      title: requiredText('Featured project title'),
      cover: image(),
      github: optionalUrl,
      external: optionalUrl,
      googleplay: optionalUrl,
      appstore: optionalUrl,
      tech: textList('Featured project technologies'),
      show: z.boolean(),
    }),
});

const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '**/index.md' }),
  schema: z.object({
    date: z.coerce.date(),
    title: requiredText('Job title'),
    company: requiredText('Job company'),
    location: requiredText('Job location'),
    range: jobRange,
    url: httpUrl,
    show: z.boolean(),
  }),
});

const education = defineCollection({
  loader: glob({ base: './src/content/education', pattern: '**/index.md' }),
  schema: z.object({
    level: requiredText('Education level'),
    school: requiredText('Education school'),
    location: requiredText('Education location'),
    passingYear: educationYear,
    url: httpUrl,
  }),
});

const uses = defineCollection({
  loader: glob({ base: './src/content/uses', pattern: '**/index.md' }),
  schema: z.object({
    title: requiredText('Uses title'),
    subtitle: requiredText('Uses subtitle'),
    order: usesOrder,
  }),
});

const about = defineCollection({
  loader: glob({ base: './src/content/about', pattern: '*.md' }),
  schema: ({ image }) =>
    z.object({
      title: requiredText('About title'),
      avatar: image(),
      skills: textList('About skills'),
    }),
});

const hero = defineCollection({
  loader: glob({ base: './src/content/hero', pattern: '*.md' }),
  schema: z.object({
    title: requiredText('Hero title'),
    name: requiredText('Hero name'),
    subtitle: requiredText('Hero subtitle'),
    contactText: requiredText('Hero contact text'),
  }),
});

const contact = defineCollection({
  loader: glob({ base: './src/content/contact', pattern: '*.md' }),
  schema: z.object({
    title: requiredText('Contact title'),
  }),
});

const funFacts = defineCollection({
  loader: glob({ base: './src/content/funFacts', pattern: '*.md' }),
  schema: z.object({
    title: requiredText('Fun fact title'),
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
