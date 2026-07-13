import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export const sortBlogEntriesByDate = (entries: BlogEntry[]) =>
  [...entries].sort(
    (left, right) =>
      new Date(right.data.date).getTime() - new Date(left.data.date).getTime(),
  );

export const getPublishedBlogEntries = (entries: BlogEntry[]) =>
  sortBlogEntriesByDate(entries.filter((entry) => !entry.data.draft));

export const formatBlogDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const getBlogPath = (entry: BlogEntry) =>
  entry.data.slug.endsWith('/')
    ? entry.data.slug.slice(0, -1)
    : entry.data.slug;

export const getBlogSlugSegment = (entry: BlogEntry) =>
  getBlogPath(entry).replace(/^\/blog\//, '');

export const slugifyTag = (tag: string) =>
  tag
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export interface BlogTagSummary {
  count: number;
  name: string;
  slug: string;
}

export const getPublishedTagSummaries = (entries: BlogEntry[]) => {
  const tagMap = new Map<string, BlogTagSummary>();

  for (const entry of getPublishedBlogEntries(entries)) {
    for (const tag of entry.data.tags) {
      const slug = slugifyTag(tag);
      const existing = tagMap.get(slug);

      if (existing) {
        existing.count += 1;
        continue;
      }

      tagMap.set(slug, { count: 1, name: tag, slug });
    }
  }

  return [...tagMap.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
};

export const getPublishedEntriesForTag = (
  entries: BlogEntry[],
  tagSlug: string,
) =>
  getPublishedBlogEntries(entries).filter((entry) =>
    entry.data.tags.some((tag: string) => slugifyTag(tag) === tagSlug),
  );
