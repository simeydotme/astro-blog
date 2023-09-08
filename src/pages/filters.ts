import { type CollectionEntry } from 'astro:content';

export const nonDrafts = ({ data }: CollectionEntry<'blog'>) => {
  const isProd:boolean = import.meta.env.PROD;
  if ( import.meta.env.PROD ) {
    return data.draft !== true;
  }
  return true;
}