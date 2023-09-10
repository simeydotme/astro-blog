import { type CollectionEntry } from 'astro:content';

type Data = CollectionEntry<'blog'> | CollectionEntry<'character'>;

export const nonDrafts = ({ data }: Data ) => {
  const isProd:boolean = import.meta.env.PROD;
  if ( import.meta.env.PROD ) {
    return data.draft !== true;
  }
  return true;
}