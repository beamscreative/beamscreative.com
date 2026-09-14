import { defineArrayMember, defineField, defineType } from 'sanity'

export const aboutPanel = defineType({
  name: 'aboutPanel',
  title: 'About panel',
  type: 'object',
  fields: [
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Collapsed label on the studio note plate, e.g. STUDIO NOTE.',
    }),
    defineField({
      name: 'facts',
      title: 'Facts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'aboutFact',
          title: 'Fact',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 6,
      description: 'Studio note paragraph under the facts.',
    }),
  ],
})
