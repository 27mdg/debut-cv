import { View } from '@react-pdf/renderer'
import texts from '../../../locales/index.js'
import { filledSections, personalDetails, sectionTitle } from '../../format.js'
import { Signature } from '../../parts/closing.jsx'
import { CvPage } from '../page.jsx'
import { Header, Section } from '../parts.jsx'
import { detailsBlocks, sectionBlocks } from '../blocks.jsx'
import { marginGap, pageStyle } from '../values.js'

// «Columna de títulos»: the header across the top, then each section's title in a narrow column
// on the left and its content beside it. Still one column of text, read in order, so as safe
// for CV-reading software as «Una columna», with titles easier to find at a glance.
export default function MarginColumn({ cv, v }) {
  const full = v.pageWidth - 2 * v.marginX
  // Grows with the text size, so the usual titles keep fitting on one line
  const margin = 118 * v.scale
  const header = { cv, v, design: cv.design, width: full }
  const ctx = { ...header, width: full - margin - marginGap }
  const details = personalDetails(cv.personal)
  const sections = filledSections(cv)
  return (
    <CvPage cv={cv} v={v} style={pageStyle(v)}>
      <Header cv={cv} details={details} ctx={header} bleed={{ top: v.marginY, left: v.marginX, right: v.marginX }}/>
      <View style={{ marginTop: 6 * v.sections }}>
        {details.otherDetails.length > 0 && (
          <Section title={texts.personal.title} blocks={detailsBlocks(details.otherDetails, ctx)} ctx={ctx} margin={margin}/>
        )}
        {sections.map((section) => (
          <Section key={section.key} title={sectionTitle(cv, section.key)} blocks={sectionBlocks(section, ctx)} ctx={ctx} margin={margin}/>
        ))}
      </View>
      <Signature cv={cv}/>
    </CvPage>
  )
}
