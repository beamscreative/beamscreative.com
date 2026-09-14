import { defineField, defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Browser tab and search-result title. Aim for ~50–60 characters.',
      validation: (rule) => rule.max(70).warning('Titles over ~60 characters may truncate in search results'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Search and social snippet. Aim for ~140–160 characters.',
      validation: (rule) => rule.max(200).warning('Descriptions over ~160 characters may truncate'),
    }),
    defineField({
      name: 'image',
      title: 'Social share image',
      type: 'image',
      description: 'Open Graph / Twitter image. 1200×630 recommended.',
      options: { hotspot: true },
    }),
  ],
})
