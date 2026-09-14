import { defineField, defineType } from 'sanity'

export const contactLinks = defineType({
  name: 'contactLinks',
  title: 'Contact links',
  type: 'object',
  fields: [
    defineField({
      name: 'whatsappUrl',
      title: 'WhatsApp URL',
      type: 'url',
      description: 'Full link, e.g. https://wa.me/85292458159',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Shown as mailto: on the mail icon.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email'
          return true
        }),
    }),
  ],
})
