import { CogIcon } from '@sanity/icons/Cog'
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'analytics', title: 'Analytics' },
    { name: 'contact', title: 'Contact' },
    { name: 'about', title: 'About', default: true },
    { name: 'profileGate', title: 'Email gate' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics measurement ID',
      type: 'string',
      group: 'analytics',
      description: 'GA4 measurement ID, e.g. G-XXXXXXXXXX. Leave blank to disable the tag.',
      placeholder: 'G-XXXXXXXXXX',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (!/^G-[A-Z0-9]+$/i.test(value.trim())) {
            return 'Use a GA4 ID like G-XXXXXXXXXX'
          }
          return true
        }),
    }),
    defineField({
      name: 'metaPixelId',
      title: 'Meta Pixel ID',
      type: 'string',
      group: 'analytics',
      description: 'Facebook / Meta Pixel ID. Leave blank to disable the tag.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (!/^\d+$/.test(value.trim())) return 'Use a numeric Meta Pixel ID'
          return true
        }),
    }),
    defineField({
      name: 'contact',
      title: 'Contact links',
      type: 'contactLinks',
      group: 'contact',
    }),
    defineField({
      name: 'about',
      title: 'About panel',
      type: 'aboutPanel',
      group: 'about',
    }),
    defineField({
      name: 'profileGate',
      title: 'Profile email gate',
      type: 'profileGate',
      group: 'profileGate',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'string',
      group: 'footer',
      description: 'Corner mark under the stage, e.g. ©2026 BEAMS Creative Ltd. All rights reserved',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site settings' }
    },
  },
})
