import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'e.g. "B2B Marketing Platform", "Real Estate Investment"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contribution',
      title: 'My Contribution',
      type: 'text',
      rows: 3,
      description: 'What you did on this project.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'accent',
      title: 'Accent Color',
      type: 'string',
      options: {
        list: [
          { title: 'Teal', value: 'teal' },
          { title: 'Amber', value: 'amber' },
          { title: 'Rust', value: 'rust' },
        ],
      },
      initialValue: 'teal',
    }),
    defineField({
      name: 'screenshot',
      title: 'Screenshot',
      type: 'image',
      options: { hotspot: true },
      description: 'Website screenshot (1280×800 recommended).',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Show this project in the homepage "Selected Work" section.',
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
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
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'screenshot',
    },
  },
});
