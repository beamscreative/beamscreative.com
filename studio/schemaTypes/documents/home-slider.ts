import { ImagesIcon } from '@sanity/icons/Images'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const homeSlider = defineType({
  name: 'homeSlider',
  title: 'Home slider',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            defineField({
              name: 'imageDesktop',
              title: 'Desktop image',
              type: 'image',
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'imageTablet',
              title: 'Tablet image',
              type: 'image',
              description: 'Used from 641px to 1023px. Falls back to the desktop image until supplied.',
              options: { hotspot: true },
            }),
            defineField({
              name: 'imageMobile',
              title: 'Mobile image',
              type: 'image',
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (rule) => rule.warning('Alt text helps accessibility and SEO'),
            }),
            defineField({
              name: 'logoTone',
              title: 'Logo colour',
              type: 'string',
              description: 'White on dark photos, black on light photos. The logo crossfades with the slide.',
              options: {
                list: [
                  { title: 'White (dark photo)', value: 'white' },
                  { title: 'Black (light photo)', value: 'black' },
                ],
                layout: 'radio',
              },
              initialValue: 'white',
            }),
          ],
          preview: {
            select: { alt: 'alt', media: 'imageDesktop', logoTone: 'logoTone' },
            prepare({ alt, media, logoTone }) {
              return {
                title: alt || 'Slide',
                subtitle: logoTone === 'black' ? 'Black logo' : 'White logo',
                media,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1).required(),
    }),
    defineField({
      name: 'fadeDuration',
      title: 'Fade duration (seconds)',
      type: 'number',
      initialValue: 0.8,
      validation: (rule) => rule.min(0).max(3),
    }),
    defineField({
      name: 'holdDuration',
      title: 'Hold duration (seconds)',
      type: 'number',
      initialValue: 4,
      validation: (rule) => rule.min(1).max(20),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home slider' }
    },
  },
})
