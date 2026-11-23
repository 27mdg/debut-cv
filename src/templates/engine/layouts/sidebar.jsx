import { View } from '@react-pdf/renderer'
import texts from '../../../locales/index.js'
import { filledSections, personalDetails, sectionTitle } from '../../format.js'
import { Signature } from '../../parts/closing.jsx'
import { CvPage } from '../page.jsx'
import { Header, Section } from '../parts.jsx'
import { detailsBlocks, sectionBlocks } from '../blocks.jsx'
import { pageStyle } from '../values.js'

// Share of the page each sidebar width takes, band included
const widths = [0.29, 0.33, 0.37]
const columnGap = 22

// The colours inside the sidebar: on a strong fill the text turns light (or dark on a light accent)
function sidebarValues(v, fill) {
  if (fill !== 'strong') return v
  return { ...v, ink: v.onAccent, muted: v.onAccentMuted, nameColor: v.onAccent, titleColor: v.onAccent, lineColor: v.onAccentMuted, linkColor: v.onAccent }
}

// «Barra lateral»: the header across the top, then a main column and a narrower sidebar holding
// the sections the user chose (design.sidebarSections). The main column comes first in the PDF,
// so CV-reading software reads the name, the profile and the experience first.
export default function SidebarColumns({ cv, v }) {
  const { design } = cv
  const left = design.sidebarSide === 'left'
  const fill = design.sidebarFill
  const band = v.pageWidth * widths[design.sidebarWidth - 1]
  // Without a band, the sidebar's text lines up with the page margin like the rest
  const outer = fill === 'none' ? v.marginX : 0.6 * v.marginX
  const inner = fill === 'none' ? 0 : 16
  const sideV = sidebarValues(v, fill)
  const main = { cv, v, design, width: v.pageWidth - band - columnGap - v.marginX }
  const side = { cv, v: sideV, design, width: band - outer - inner }
  const header = { cv, v, design, width: v.pageWidth - 2 * v.marginX }

  const details = personalDetails(cv.personal)
  const sections = filledSections(cv)
  const inSidebar = (key) => design.sidebarSections.includes(key)
  const columnTop = 14 * v.sections
  const page = { ...pageStyle(v), paddingHorizontal: 0 }
  const bandColor = fill === 'strong' ? v.accent : v.accentLight

  return (
    <CvPage cv={cv} v={v} style={page} clear={fill === 'none' ? {} : { [left ? 'left' : 'right']: band + columnGap }}>
      {fill !== 'none' && (
        <View fixed style={{ position: 'absolute', top: 0, bottom: 0, width: band, backgroundColor: bandColor, [left ? 'left' : 'right']: 0 }}/>
      )}
      {/* White behind the header, from the very top of the page, so the band starts below it */}
      <View style={{ marginTop: -v.marginY, paddingTop: v.marginY, paddingBottom: 12 * v.sections, paddingHorizontal: v.marginX, backgroundColor: '#ffffff' }}>
        <Header cv={cv} details={details} ctx={header}/>
      </View>
      <View style={{ flexDirection: left ? 'row-reverse' : 'row' }}>
        <View style={{ width: main.width, paddingTop: columnTop, [left ? 'marginLeft' : 'marginRight']: columnGap, [left ? 'marginRight' : 'marginLeft']: v.marginX }}>
          {sections.filter(({ key }) => !inSidebar(key)).map((section, i) => (
            <Section key={section.key} first={i === 0} title={sectionTitle(cv, section.key)} blocks={sectionBlocks(section, main)} ctx={main}/>
          ))}
          <Signature cv={cv}/>
        </View>
        <View style={{ width: band, paddingTop: columnTop, paddingLeft: left ? outer : inner, paddingRight: left ? inner : outer, color: sideV.ink }}>
          {details.otherDetails.length > 0 && (
            <Section first title={texts.personal.title} blocks={detailsBlocks(details.otherDetails, side, 1)} ctx={side}/>
          )}
          {sections.filter(({ key }) => inSidebar(key)).map((section, i) => (
            <Section
              key={section.key}
              first={i === 0 && details.otherDetails.length === 0}
              title={sectionTitle(cv, section.key)}
              blocks={sectionBlocks(section, side)}
              ctx={side}
            />
          ))}
        </View>
      </View>
    </CvPage>
  )
}
