import { DocumentPdfIcon } from '@sanity/icons/DocumentPdf'
import { defineField, defineType } from 'sanity'

export const portfolioDownload = defineType({
  name: 'portfolioDownload',
  title: 'Portfolio download',
  type: 'document',
  icon: DocumentPdfIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
      description: 'When a PDF is uploaded, a Download button appears next to Preview.',
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'Download PDF',
    }),
    defineField({
      name: 'file',
      title: 'PDF file',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
  ],
  preview: {
    select: { enabled: 'enabled', label: 'label' },
    prepare({ enabled, label }) {
      return {
        title: 'Portfolio download',
        subtitle: enabled ? label || 'Enabled' : 'Disabled',
      }
    },
  },
})
