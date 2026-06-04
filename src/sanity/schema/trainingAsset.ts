import { defineField, defineType } from 'sanity';

export const trainingAsset = defineType({
  name: 'trainingAsset',
  title: 'Training Asset',
  type: 'document',
  fieldsets: [
    {
      name: 'landing',
      title: 'Landing Page',
      description:
        'Per-asset landing copy and visuals. Blank fields fall back to defaults.',
      options: { collapsible: true, collapsed: true },
    },
  ],
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

    // ── Landing page copy ──────────────────────────────────────────────
    // The landing template is generic; this is where each asset supplies its
    // own headline, sentence, and section copy. Leave a field blank to fall
    // back to a sensible default (title-derived).
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'text',
      rows: 2,
      fieldset: 'landing',
      description:
        'The large headline in the hero. Line breaks are preserved. Defaults to the title.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 2,
      fieldset: 'landing',
      description:
        'The sentence under the headline. Wrap a phrase in *asterisks* to render it in the accent color.',
    }),
    defineField({
      name: 'heroSlides',
      title: 'Hero Animation Slides',
      type: 'array',
      fieldset: 'landing',
      description:
        'The animated examples that crossfade in the hero. Each needs a pre-built visual (pick from the list). Leave empty to hide the hero animation entirely — the hero collapses to a single column.',
      of: [
        {
          type: 'object',
          name: 'heroSlide',
          fields: [
            {
              name: 'visual',
              title: 'Visual',
              type: 'string',
              options: {
                list: [
                  { title: 'Retargeting', value: 'retargeting' },
                  { title: 'Click-Through Rate', value: 'click-rate' },
                  { title: 'Conversion', value: 'conversion' },
                  { title: 'Frequency', value: 'frequency' },
                  { title: 'Bounce Rate', value: 'bounce' },
                ],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'term',
              title: 'Term Label',
              type: 'string',
              description: 'The short label shown under the animation.',
              validation: (rule) => rule.required(),
            },
            {
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2,
              description: 'One plain-English line explaining the term.',
              validation: (rule) => rule.required(),
            },
          ],
          preview: { select: { title: 'term', subtitle: 'visual' } },
        },
      ],
    }),
    defineField({
      name: 'showcaseTitle',
      title: 'Showcase Heading',
      type: 'string',
      fieldset: 'landing',
      description:
        'Heading for the "visualized" showcase section. Only shown if showcase specimens are set.',
    }),
    defineField({
      name: 'showcaseLead',
      title: 'Showcase Lead Specimen',
      type: 'string',
      fieldset: 'landing',
      description:
        'Exact term name for the large showcase specimen. Must be a term that has a built visual. Leave blank to skip the showcase.',
    }),
    defineField({
      name: 'showcasePair',
      title: 'Showcase Pair Specimens',
      type: 'array',
      of: [{ type: 'string' }],
      fieldset: 'landing',
      validation: (rule) => rule.max(2),
      description:
        'Up to two exact term names for the smaller showcase specimens. Must be terms that have built visuals.',
    }),
    defineField({
      name: 'categoriesTitle',
      title: 'Categories Heading',
      type: 'string',
      fieldset: 'landing',
      description: 'Heading for the category index section. Defaults to a generic line.',
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
