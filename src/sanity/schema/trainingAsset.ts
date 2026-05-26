import { defineField, defineType } from 'sanity';

export const trainingAsset = defineType({
  name: 'trainingAsset',
  title: 'Training Asset',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Word List', value: 'word-list' },
          { title: 'Playbook', value: 'playbook' },
          { title: 'Checklist', value: 'checklist' },
          { title: 'Template', value: 'template' },
          { title: 'Guide', value: 'guide' },
        ],
      },
      initialValue: 'word-list',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short subhead shown under the title on the landing page.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Longer prose shown on the landing page above the form.',
    }),
    defineField({
      name: 'accent',
      title: 'Accent',
      type: 'string',
      options: {
        list: [
          { title: 'Gold (default)', value: 'gold' },
          { title: 'Teal', value: 'teal' },
          { title: 'Amber', value: 'amber' },
          { title: 'Rust', value: 'rust' },
        ],
      },
      initialValue: 'gold',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first on the /training index.',
      initialValue: 1,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'terms',
      title: 'Terms (for Word Lists)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'term',
          fields: [
            {
              name: 'term',
              title: 'Term',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'definition',
              title: 'Definition',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            },
            {
              name: 'group',
              title: 'Group / Section',
              type: 'string',
              description:
                'Optional grouping label like "Creative", "Paid Media", "Attribution". Used to section the printed list.',
            },
          ],
          preview: {
            select: { title: 'term', subtitle: 'group' },
          },
        },
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title Override',
      type: 'string',
    }),
    defineField({
      name: 'noIndex',
      title: 'Exclude from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'heroImage' },
  },
});
