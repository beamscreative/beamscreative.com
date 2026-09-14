import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineField, defineType } from 'sanity'

export const profileLead = defineType({
  name: 'profileLead',
  title: 'Profile lead',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
      readOnly: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'First submitted',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'lastSeenAt',
      title: 'Last seen',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'previewCount',
      title: 'Preview count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'lastPreviewAt',
      title: 'Last preview',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'downloaded',
      title: 'Downloaded PDF',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'downloadCount',
      title: 'Download count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'lastDownloadAt',
      title: 'Last download',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      email: 'email',
      previewCount: 'previewCount',
      downloaded: 'downloaded',
    },
    prepare({ email, previewCount, downloaded }) {
      return {
        title: email || 'Profile lead',
        subtitle: `${previewCount || 0} preview${previewCount === 1 ? '' : 's'} · ${downloaded ? 'downloaded' : 'no download'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Last seen',
      name: 'lastSeenAtDesc',
      by: [{ field: 'lastSeenAt', direction: 'desc' }],
    },
  ],
})
