import { Fragment } from 'react'
import { View, Image, Link } from '@react-pdf/renderer'
import Text from '../parts/Text.jsx'
import { fullUrl, hasText } from '../format.js'
import { fitWords, fittingSize } from './measure.js'
import { marginGap, textFont } from './values.js'

// The components every layout is built from. `ctx` = { cv, v (engineValues), design, width },
// where `width` is the column's text width in points (long words are split to fit it).

const bulletGlyphs = { dot: '•', dash: '–', arrow: '›' }

// The square is drawn: the fonts' basic letters have no square glyph
/** A description line's bullet; `room` is the width it takes. */
export function Bullet({ kind, v, room }) {
  if (kind === 'square') {
    return (
      <View style={{ width: room, paddingTop: (v.textSize * v.lineHeight) / 2 - 1.6 }}>
        <View style={{ width: 3.2, height: 3.2, backgroundColor: v.ink }}/>
      </View>
    )
  }
  return <Text style={{ width: room }}>{bulletGlyphs[kind]}</Text>
}

/** A line's text, bold parts and links, with words too long for `width` split. */
export function Segments({ segments, width, v }) {
  return segments.map((s, i) => {
    if (s.href) {
      return (
        <Link key={i} src={fullUrl(s.href)} style={{ color: v.linkColor, textDecoration: 'underline' }}>
          {fitWords(s.text, width, textFont(v))}
        </Link>
      )
    }
    if (s.bold) return <Text key={i} style={{ fontWeight: 'bold' }}>{fitWords(s.text, width, textFont(v, true))}</Text>
    return fitWords(s.text, width, textFont(v))
  })
}

// Uppercase titles take this much extra room per letter
const titleSpacing = 0.5

// `width`: the room for the title; in a narrow margin column it shrinks a little so that its
// longest word fits whole ("EXTRACURRICULARES") instead of being split
function SectionTitle({ title, ctx, width }) {
  const { v, design } = ctx
  const upper = design.titleCase === 'upper'
  const shown = upper ? title.toUpperCase() : title
  const longest = shown.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '')
  const room = width - (upper ? titleSpacing * longest.length : 0)
  const font = { family: v.headingFont[0], size: [10, 11, 12.5][design.titleSize - 1] * v.scale, bold: true }
  const size = fittingSize(longest, room, font, 0.8)
  return (
    <View>
      <Text
        style={{
          fontFamily: v.headingFont,
          fontSize: size,
          fontWeight: 'bold',
          lineHeight: 1.25,
          // Wider spacing would make CV-reading software read "P E R F I L"
          letterSpacing: upper ? titleSpacing : 0,
          color: v.titleColor,
        }}
      >
        {fitWords(shown, room, { ...font, size })}
      </Text>
      {design.titleStyle !== 'plain' && <View style={{ height: 0.8, marginTop: 3, backgroundColor: v.lineColor }}/>}
    </View>
  )
}

/**
 * A section: its title stays on the same page as the first block's head (never alone at the
 * bottom of a page); every block's head is kept together and the rest flows across pages.
 * With `margin` (the title column's width, in points) the title goes in a column on the left
 * and the content beside it; `ctx.width` is then the content's width.
 */
export function Section({ title, blocks, ctx, first = false, margin = 0 }) {
  if (blocks.length === 0) return null
  const [one, ...others] = blocks
  // Every piece of content is indented on its own, rather than the whole column being one box
  // beside the title, so that the content can still flow across pages
  const indent = margin ? { marginLeft: margin + marginGap } : {}
  return (
    <View style={{ marginTop: first ? 0 : 15 * ctx.v.sections }}>
      <View wrap={false} style={margin ? { flexDirection: 'row' } : {}}>
        <View style={margin ? { width: margin } : {}}>
          <SectionTitle title={title} ctx={ctx} width={margin || ctx.width}/>
        </View>
        <View style={margin ? { flex: 1, marginLeft: marginGap } : { marginTop: 5 }}>{one.head}</View>
      </View>
      <View style={indent}>{one.rest}</View>
      {others.map((block) => (
        <Fragment key={block.key}>
          <View wrap={false} style={[indent, { marginTop: block.gap }]}>{block.head}</View>
          <View style={indent}>{block.rest}</View>
        </Fragment>
      ))}
    </View>
  )
}

// 'https://www.ana.es/' → 'ana.es': shorter, and still opens (the link keeps the full address)
function shortLink(address) {
  return address.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')
}

function contactHref(item) {
  if (item.type === 'email') return `mailto:${item.text.trim()}`
  if (item.type === 'phone') return `tel:${item.text.replace(/[^\d+]/g, '')}`
  if (item.type === 'address') return null
  return fullUrl(item.text.trim())
}

const separators = { dot: '·', bar: '|', bullet: '•' }

// Contact details on one line that wraps between them; each one opens (mail, phone, web)
function ContactLine({ contact, ctx, width }) {
  const { v, design } = ctx
  const separator = `   ${separators[design.contactSeparator]}   `
  return (
    <Text style={{ marginTop: 6, color: v.ink }}>
      {contact.map((item, i) => {
        const shown = item.type === 'email' || item.type === 'phone' || item.type === 'address' || design.linkStyle === 'full'
          ? item.text.trim()
          : shortLink(item.text)
        const text = fitWords(shown, width, textFont(v))
        const href = contactHref(item)
        return (
          <Fragment key={item.key}>
            {i > 0 && <Text style={{ color: v.muted }}>{separator}</Text>}
            {href ? <Link src={href} style={{ color: v.ink, textDecoration: 'none' }}>{text}</Link> : text}
          </Fragment>
        )
      })}
    </Text>
  )
}

const photoSizes = [62, 78, 94]

function Photo({ src, ctx }) {
  const { v, design } = ctx
  const size = photoSizes[design.photoSize - 1]
  const height = design.photoShape === 'portrait' ? (size * 4) / 3 : size
  const radius = { circle: size / 2, rounded: 12, square: 0, portrait: 4 }[design.photoShape]
  return (
    <Image
      src={src}
      style={{
        width: size,
        height,
        borderRadius: radius,
        objectFit: 'cover',
        ...(design.photoBorder ? { borderWidth: 1.5, borderColor: v.accent } : {}),
      }}
    />
  )
}

/** Name, job title, contact and photo. Grows with a long name instead of cutting it. */
export function Header({ cv, details, ctx }) {
  const { v, design, width } = ctx
  const photo = cv.personal.photo
  const photoRoom = photo ? photoSizes[design.photoSize - 1] + 18 : 0
  const centred = design.headerAlign === 'center'
  const textRoom = centred ? width : width - photoRoom
  const nameFont = { family: v.headingFont[0], size: [22, 26, 30][design.nameSize - 1] * v.scale, bold: true }
  const nameSize = fittingSize(details.fullName, textRoom, nameFont, 0.8)
  const jobTitle = cv.personal.jobTitle
  return (
    <View
      style={{
        // The name comes first in the PDF (read first); the photo is drawn before it where needed
        flexDirection: centred ? 'column-reverse' : design.photoSide === 'left' ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: centred ? 0 : 1, alignItems: centred ? 'center' : 'flex-start', marginTop: centred && photo ? 10 : 0 }}>
        {hasText(details.fullName) && (
          <Text style={{ fontFamily: v.headingFont, fontSize: nameSize, fontWeight: 'bold', lineHeight: 1.15, color: v.nameColor, textAlign: centred ? 'center' : 'left' }}>
            {fitWords(details.fullName, textRoom, { ...nameFont, size: nameSize })}
          </Text>
        )}
        {hasText(jobTitle) && (
          <Text style={{ marginTop: 3, fontSize: 12 * v.scale, color: v.titleColor, textAlign: centred ? 'center' : 'left' }}>
            {fitWords(jobTitle, textRoom, { ...textFont(v), size: 12 * v.scale })}
          </Text>
        )}
        {details.contact.length > 0 && <ContactLine contact={details.contact} ctx={ctx} width={textRoom}/>}
      </View>
      {photo && (
        <View style={centred ? {} : { marginLeft: design.photoSide === 'right' ? 18 : 0, marginRight: design.photoSide === 'left' ? 18 : 0 }}>
          <Photo src={photo} ctx={ctx}/>
        </View>
      )}
    </View>
  )
}
