import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Devin Alexander' },
  },
  collections: {
    journal: collection({
      label: 'Journal',
      slugField: 'title',
      path: 'src/content/journal/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          description: 'Used as the excerpt on listings and as the default meta description for SEO.',
          multiline: true,
        }),
        tag: fields.select({
          label: 'Tag',
          options: [
            { value: 'essay', label: 'Essay' },
            { value: 'process', label: 'Process' },
            { value: 'leadership', label: 'Leadership' },
            { value: 'strategy', label: 'Strategy' },
            { value: 'design', label: 'Design' },
          ],
          defaultValue: 'essay',
        }),
        date: fields.date({ label: 'Date' }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),

        // — Media —
        heroImage: fields.image({
          label: 'Hero Image',
          description: 'Displayed at the top of the post and on listing cards. Also used as the OG image if no dedicated OG image is set.',
          directory: 'public/images/journal',
          publicPath: '/images/journal/',
        }),
        heroAlt: fields.text({
          label: 'Hero Image Alt Text',
          description: 'Accessible description of the hero image.',
        }),

        // — SEO & Social —
        ogImage: fields.image({
          label: 'OG Image',
          description: 'Custom image for social sharing (1200×630px recommended). Falls back to hero image if empty.',
          directory: 'public/images/journal/og',
          publicPath: '/images/journal/og/',
        }),
        seoTitle: fields.text({
          label: 'SEO Title Override',
          description: 'Custom title for search engines and social cards. Leave blank to use the post title.',
        }),
        noIndex: fields.checkbox({
          label: 'Exclude from search engines',
          description: 'If checked, adds a noindex meta tag to this post.',
          defaultValue: false,
        }),

        body: fields.document({
          label: 'Body',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/journal',
            publicPath: '/images/journal/',
          },
        }),
      },
    }),
  },
});
