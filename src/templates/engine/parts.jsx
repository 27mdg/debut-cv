import { Fragment } from 'react'
import { View, Image, Link } from '@react-pdf/renderer'
import Text from '../parts/Text.jsx'
import { fullUrl, hasText } from '../format.js'
import { PdfIcon } from '../parts/icons.jsx'
import { fitWords, fittingSize, textWidth } from './measure.js'
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

function isLink(item) {
  return item.type !== 'email' && item.type !== 'phone' && item.type !== 'address'
}

// One contact detail, split to fit `width`; it opens (mail, phone, web) where it can
function ContactText({ item, ctx, width }) {
  const { v, design } = ctx
  const shown = isLink(item) && design.linkStyle !== 'full' ? shortLink(item.text) : item.text.trim()
  const text = fitWords(shown, width, textFont(v))
  const href = contactHref(item)
  return href ? <Link src={href} style={{ color: v.ink, textDecoration: 'none' }}>{text}</Link> : text
}

// Contact details on one line that wraps between them, with the chosen separator
function ContactLine({ contact, ctx, width, align }) {
  const { v, design } = ctx
  const separator = `   ${separators[design.contactSeparator]}   `
  return (
    <Text style={{ color: v.ink, textAlign: align }}>
      {contact.map((item, i) => (
        <Fragment key={item.key}>
          {i > 0 && <Text style={{ color: v.muted }}>{separator}</Text>}
          <ContactText item={item} ctx={ctx} width={width}/>
        </Fragment>
      ))}
    </Text>
  )
}

// With icons, each detail is its own little row (an icon cannot sit inside a line of text);
// the icons part them, so no separator. The text stays real text beside each drawing.
function ContactIcons({ contact, ctx, width, centred }) {
  const { v } = ctx
  const size = v.textSize
  const room = size + 5
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: centred ? 'center' : 'flex-start', columnGap: 16, rowGap: 3 }}>
      {contact.map((item) => (
        <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', maxWidth: width }}>
          <PdfIcon name={item.type} size={size} color={v.iconColor}/>
          <Text style={{ marginLeft: 5, flexShrink: 1, color: v.ink }}>
            <ContactText item={item} ctx={ctx} width={width - room}/>
          </Text>
        </View>
      ))}
    </View>
  )
}

// One line, two (phone, email and city; then the links) or one detail per line
function Contact({ contact, ctx, width, centred }) {
  const { design } = ctx
  const groups = design.contactLayout === 'column'
    ? contact.map((item) => [item])
    : design.contactLayout === 'rows'
      ? [contact.filter((item) => !isLink(item)), contact.filter(isLink)].filter((group) => group.length > 0)
      : [contact]
  return (
    <View style={{ marginTop: 6, alignItems: centred ? 'center' : 'flex-start' }}>
      {groups.map((group, i) => (
        <View key={group[0].key} style={{ marginTop: i > 0 ? 3 : 0, maxWidth: width }}>
          {design.contactIcons
            ? <ContactIcons contact={group} ctx={ctx} width={width} centred={centred}/>
            : <ContactLine contact={group} ctx={ctx} width={width} align={centred ? 'center' : 'left'}/>}
        </View>
      ))}
    </View>
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

// On the strong fill the header's text turns light (or dark on a light accent), like the sidebar's
function onFill(v) {
  return { ...v, ink: v.onAccent, muted: v.onAccentMuted, nameColor: v.onAccent, titleColor: v.onAccent, iconColor: v.onAccent, linkColor: v.onAccent }
}

/**
 * Name, job title, contact and photo. Grows with a long name instead of cutting it.
 * `bleed` ({ top, left, right }, in points): how far a header fill reaches out to the page's
 * edges from the header's own box.
 */
export function Header({ cv, details, ctx, bleed }) {
  const fill = ctx.design.headerFill
  if (fill === 'none') return <HeaderContent cv={cv} details={details} ctx={ctx}/>
  const inner = fill === 'strong' ? { ...ctx, v: onFill(ctx.v) } : ctx
  return (
    <View
      style={{
        marginTop: -bleed.top,
        marginLeft: -bleed.left,
        marginRight: -bleed.right,
        paddingTop: bleed.top,
        paddingLeft: bleed.left,
        paddingRight: bleed.right,
        paddingBottom: 18,
        backgroundColor: fill === 'strong' ? ctx.v.accent : ctx.v.accentLight,
      }}
    >
      <HeaderContent cv={cv} details={details} ctx={inner}/>
    </View>
  )
}

function HeaderContent({ cv, details, ctx }) {
  const { v, design, width } = ctx
  const photo = cv.personal.photo
  const photoRoom = photo ? photoSizes[design.photoSize - 1] + 18 : 0
  const centred = design.headerAlign === 'center'
  const textRoom = centred ? width : width - photoRoom
  const nameFont = { family: v.headingFont[0], size: [22, 26, 30][design.nameSize - 1] * v.scale, bold: true }
  const nameSize = fittingSize(details.fullName, textRoom, nameFont, 0.8)
  const jobTitle = cv.personal.jobTitle
  const jobSize = 12 * v.scale
  const jobFont = { ...textFont(v), size: jobSize }
  const separator = `   ${separators[design.contactSeparator]}   `
  // Only when both fit on one line: otherwise the name itself would break to make room
  const inline = design.jobTitlePlace === 'inline' && hasText(jobTitle) && hasText(details.fullName)
    && textWidth(details.fullName, { ...nameFont, size: nameSize }) + textWidth(separator + jobTitle.trim(), jobFont) <= textRoom
  return (
    <View
      style={{
        // The name comes first in the PDF (read first); the photo is drawn before it where needed
        flexDirection: centred ? 'column-reverse' : design.photoSide === 'left' ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={centred ? { alignItems: 'center', marginTop: photo ? 10 : 0 } : { flex: 1, alignItems: 'flex-start' }}>
        {hasText(details.fullName) && (
          <Text style={{ fontFamily: v.headingFont, fontSize: nameSize, fontWeight: 'bold', lineHeight: 1.15, color: v.nameColor, textAlign: centred ? 'center' : 'left' }}>
            {fitWords(details.fullName, textRoom, { ...nameFont, size: nameSize })}
            {/* On the name's line: smaller, after a separator */}
            {inline && (
              <Text style={{ fontFamily: v.font, fontSize: jobSize, fontWeight: 'normal', color: v.titleColor }}>
                {separator}{fitWords(jobTitle, textRoom, jobFont)}
              </Text>
            )}
          </Text>
        )}
        {hasText(jobTitle) && !inline && (
          <Text style={{ marginTop: 3, fontSize: jobSize, color: v.titleColor, textAlign: centred ? 'center' : 'left' }}>
            {fitWords(jobTitle, textRoom, jobFont)}
          </Text>
        )}
        {details.contact.length > 0 && <Contact contact={details.contact} ctx={ctx} width={textRoom} centred={centred}/>}
      </View>
      {photo && (
        <View style={centred ? {} : { marginLeft: design.photoSide === 'right' ? 18 : 0, marginRight: design.photoSide === 'left' ? 18 : 0 }}>
          <Photo src={photo} ctx={ctx}/>
        </View>
      )}
    </View>
  )
}
