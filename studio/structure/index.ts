import { DocumentPdfIcon } from '@sanity/icons/DocumentPdf'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { ImagesIcon } from '@sanity/icons/Images'
import { StackIcon } from '@sanity/icons/Stack'
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home slider')
        .icon(ImagesIcon)
        .child(S.document().schemaType('homeSlider').documentId('homeSlider').title('Home slider')),
      S.divider(),
      S.listItem()
        .title('Portfolio popup')
        .icon(StackIcon)
        .child(
          S.document().schemaType('portfolioPopup').documentId('portfolioPopup').title('Portfolio popup'),
        ),
      S.listItem()
        .title('Portfolio download')
        .icon(DocumentPdfIcon)
        .child(
          S.document()
            .schemaType('portfolioDownload')
            .documentId('portfolioDownload')
            .title('Portfolio download'),
        ),
      S.divider(),
      S.listItem()
        .title('Profile leads')
        .icon(EnvelopeIcon)
        .child(
          S.documentTypeList('profileLead')
            .title('Profile leads')
            .defaultOrdering([{ field: 'lastSeenAt', direction: 'desc' }]),
        ),
    ])
