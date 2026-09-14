import { defineField, defineType } from 'sanity'

export const profileGate = defineType({
  name: 'profileGate',
  title: 'Profile email gate',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Email step headline, e.g. WE WOULD LIKE MEET YOU!',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Use a line break where the desktop layout should wrap.',
    }),
    defineField({
      name: 'emailPlaceholder',
      title: 'Email placeholder',
      type: 'string',
    }),
    defineField({
      name: 'submitLabel',
      title: 'Submit button',
      type: 'string',
    }),
    defineField({
      name: 'thankYouTitle',
      title: 'Thank-you title',
      type: 'string',
      description: 'Shown after a valid email is entered.',
    }),
    defineField({
      name: 'previewLabel',
      title: 'Preview button',
      type: 'string',
    }),
  ],
})
