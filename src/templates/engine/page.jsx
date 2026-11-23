import { Document, Page } from '@react-pdf/renderer'
import Text from '../parts/Text.jsx'
import texts, { language } from '../../locales/index.js'
import { baseName } from '../../data/file.js'
import { hasText, itemsWithContent, join, pageWithFooter } from '../format.js'
import { Footer } from '../parts/closing.jsx'

/**
 * The PDF with its details filled in (title, author, language, keywords): some CV-reading
 * software and every PDF reader show them.
 */
export function CvDocument({ cv, children }) {
  const name = join([cv.personal.firstName, cv.personal.lastName], ' ')
  const skills = itemsWithContent(cv.skills).filter((item) => !item.hidden).map((item) => item.skill)
  return (
    <Document
      title={baseName(cv)}
      author={name}
      subject={cv.personal.jobTitle}
      keywords={join(skills, ', ')}
      creator={texts.app.title}
      producer={texts.app.title}
      language={cv.language || language}
    >
      {children}
    </Document>
  )
}

/**
 * One flowing page of the CV: its size, room for the footer and, from page 2 on, the name and
 * page number in the top margin (sheets printed loose can be put back together).
 * `clear`: { left, right }, the page's edges kept free of coloured bands, where the page number
 * and the footer go.
 */
export function CvPage({ cv, v, style, clear = {}, children }) {
  const name = join([cv.personal.firstName, cv.personal.lastName], ' ')
  return (
    <Page size={v.pageSize} style={pageWithFooter(style, cv)}>
      {children}
      {cv.design.pageNumbers && (
        <Text
          fixed
          style={{
            position: 'absolute',
            top: Math.max(8, v.marginY / 2 - 5),
            left: clear.left ?? v.marginX,
            right: clear.right ?? v.marginX,
            fontSize: 7.5,
            textAlign: 'right',
            color: v.muted,
          }}
          render={({ pageNumber, totalPages }) => (pageNumber > 1
            ? join([hasText(name) ? name : '', texts.common.pageNumber(pageNumber, totalPages)])
            : '')}
        />
      )}
      <Footer cv={cv} left={clear.left ?? 40} right={clear.right ?? 40}/>
    </Page>
  )
}
