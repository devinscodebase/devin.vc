import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../../lib/og-image';
import { sanityClient } from '../../../lib/sanity';

export const prerender = true;

interface JournalPost {
  slug: string;
  title: string;
  description?: string;
  tag?: string;
  date?: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await sanityClient.fetch<JournalPost[]>(
    `*[_type == "journal"] { "slug": slug.current, title, description, tag, date }`
  );

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: JournalPost };

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  const png = await generateOgImage({
    type: 'journal',
    title: post.title,
    subtitle: post.description,
    tag: post.tag,
    date: formattedDate,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
