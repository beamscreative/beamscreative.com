import { StackIcon } from '@sanity/icons/Stack'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const portfolioPopup = defineType({
  name: 'portfolioPopup',
  title: 'Portfolio popup',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Use the pages below',
      type: 'boolean',
      initialValue: false,
      description:
        'Off: the Preview sheet shows the profile pages committed with the site. On: it shows the pages below instead.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal label. Not shown on the site.',
    }),
    defineField({
      name: 'items',
      title: 'Pages',
      type: 'array',
      description: 'One image per profile page, in reading order. Exported at 16:9.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'portfolioItem',
          title: 'Page',
          fields: [
            defineField({
              name: 'image',
              title: 'Page image',
              type: 'image',
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Alt text',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
            prepare({ title, media }) {
              return { title: title || 'Portfolio page', media }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
  ],
  preview: {
    select: { enabled: 'enabled' },
    prepare({ enabled }) {
      return { title: 'Portfolio popup', subtitle: enabled ? 'Enabled' : 'Disabled' }
    },
  },
})
