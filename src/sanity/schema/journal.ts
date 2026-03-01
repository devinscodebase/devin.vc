import { defineField, defineType } from 'sanity';

export const journal = defineType({
  name: 'journal',
  title: 'Journal',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'Used as the excerpt on listings and as the default meta description for SEO.',
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      options: {
        list: [
          { title: 'Essay', value: 'essay' },
          { title: 'Process', value: 'process' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Strategy', value: 'strategy' },
          { title: 'Design', value: 'design' },
        ],
      },
      initialValue: 'essay',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Displayed at the top of the post and on listing cards. Also used as the OG image if no dedicated OG image is set.',
    }),
    defineField({
      name: 'heroAlt',
      title: 'Hero Image Alt Text',
      type: 'string',
      description: 'Accessible description of the hero image.',
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      description:
        'Custom image for social sharing (1200×630px recommended). Falls back to hero image if empty.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title Override',
      type: 'string',
      description:
        'Custom title for search engines and social cards. Leave blank to use the post title.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Exclude from search engines',
      type: 'boolean',
      description: 'If checked, adds a noindex meta tag to this post.',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) =>
                      rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tag',
      media: 'heroImage',
    },
  },
});
