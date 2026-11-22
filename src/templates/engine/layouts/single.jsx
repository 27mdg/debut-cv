import { View } from '@react-pdf/renderer'
import texts from '../../../locales/index.js'
import { filledSections, personalDetails, sectionTitle } from '../../format.js'
import { Signature } from '../../parts/closing.jsx'
import { CvPage } from '../page.jsx'
import { Header, Section } from '../parts.jsx'
import { detailsBlocks, sectionBlocks } from '../blocks.jsx'

// «Una columna»: the header on top, then every section in the user's order, full width. The
// safest layout for CV-reading software, and the one most advised for any job portal.
export default function SingleColumn({ cv, v }) {
  const ctx = { cv, v, design: cv.design, width: v.pageWidth - 2 * v.marginX }
  const details = personalDetails(cv.personal)
  const sections = filledSections(cv)
  const page = {
    paddingTop: v.marginY,
    paddingBottom: v.marginY,
    paddingHorizontal: v.marginX,
    fontFamily: v.font,
    fontSize: v.textSize,
    lineHeight: v.lineHeight,
    color: v.ink,
  }
  return (
    <CvPage cv={cv} v={v} style={page}>
      <Header cv={cv} details={details} ctx={ctx}/>
      <View style={{ marginTop: 6 * v.sections }}>
        {details.otherDetails.length > 0 && (
          <Section title={texts.personal.title} blocks={detailsBlocks(details.otherDetails, ctx)} ctx={ctx}/>
        )}
        {sections.map((section) => (
          <Section key={section.key} title={sectionTitle(cv, section.key)} blocks={sectionBlocks(section, ctx)} ctx={ctx}/>
        ))}
      </View>
      <Signature cv={cv}/>
    </CvPage>
  )
}
