import { View } from '@react-pdf/renderer'
import Text from '../parts/Text.jsx'
import texts from '../../locales/index.js'
import { hasText, itemParts, join, languageLevel, parseRichText } from '../format.js'
import { fitWords, textWidth } from './measure.js'
import { textFont } from './values.js'
import { Bullet, Segments } from './parts.jsx'

// Each section's content as blocks { key, gap, head: [], rest: [] }: the head stays together on
// one page (and the first one with the section title, see Section in parts.jsx), the rest may
// continue on the next page. `ctx` as in parts.jsx.

// A paragraph longer than this many letters is not kept with its title: kept together, a block
// taller than the page is squeezed by react-pdf and its lines drawn on top of each other
const longParagraph = 400

const bulletRoom = 10

// A description's lines (bullets, bold, links), one element per line, so they can be split
// between the block's head and the part that may flow onto the next page
function richLines(text, ctx, gap) {
  const { v, design, width } = ctx
  const hasBullet = design.bullet !== 'none'
  return parseRichText(text).map((line, i) => {
    const style = { marginTop: i === 0 ? 0 : gap }
    if (line.bullet && hasBullet) {
      return (
        <View key={i} style={[style, { flexDirection: 'row' }]}>
          <Bullet kind={design.bullet} v={v} room={bulletRoom}/>
          <Text style={{ flex: 1 }}><Segments segments={line.segments} width={width - bulletRoom} v={v}/></Text>
        </View>
      )
    }
    // An empty line keeps its height, as a gap between paragraphs
    return <Text key={i} style={style}>{line.segments.length ? <Segments segments={line.segments} width={width} v={v}/> : ' '}</Text>
  })
}

/**
 * Text split into what must stay with the section title (the first paragraph, if not too long)
 * and the rest, which may continue on the next page. → { head: [], rest: [] }
 */
function splitLines(text, lines) {
  const firstLength = text.split('\n')[0].length
  const [first, ...rest] = lines
  return firstLength > longParagraph ? { head: [], rest: lines } : { head: [first], rest }
}

function entryBlock(key, item, ctx) {
  const { v, design, width } = ctx
  const parts = itemParts(key, item)
  // "Company first" swaps the two only when both exist
  const swap = design.entryOrder === 'organisation' && hasText(parts.subtitle)
  const title = swap ? parts.subtitle : parts.title
  const subtitle = swap ? parts.title : parts.subtitle
  const dateRight = design.datePlace === 'right' && hasText(parts.date)
  const meta = join([subtitle, dateRight ? '' : parts.date, parts.place])
  const dateRoom = dateRight ? (textWidth(parts.date, { family: v.font[0], size: v.smallSize }) ?? 70) + 12 : 0

  const head = []
  if (hasText(title) || dateRight) {
    head.push(
      <View key="title" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>{fitWords(title, width - dateRoom, textFont(v, true))}</Text>
        {dateRight && <Text style={{ marginLeft: 12, fontSize: v.smallSize, color: v.muted, lineHeight: (v.lineHeight * v.textSize) / v.smallSize }}>{parts.date}</Text>}
      </View>,
    )
  }
  if (hasText(meta)) head.push(<Text key="meta" style={{ color: v.muted }}>{fitWords(meta, width, textFont(v))}</Text>)
  let rest = []
  if (hasText(item.description)) {
    const split = splitLines(item.description, richLines(item.description, ctx, 1.5 * v.paragraphs))
    const top = { marginTop: 3 }
    head.push(...split.head.map((line, i) => <View key={`d${i}`} style={top}>{line}</View>))
    rest = split.rest.map((line, i) => <View key={`r${i}`} style={split.head.length ? { marginTop: 1.5 * v.paragraphs } : top}>{line}</View>)
  }
  return { key: item.id, gap: 8 * v.paragraphs, head, rest }
}

const commaField = { hobbies: 'interest', qualities: 'quality' }

function skillWithLevel(item) {
  return item.level !== '' ? `${item.skill} (${texts.common.skillLevels[item.level]})` : item.skill
}

// Skills one per line, in `columns` columns; each row is its own block, so a long list flows
// onto the next page instead of being squeezed
function skillRows(groups, ctx) {
  const { v, width, design } = ctx
  const columns = design.skillsColumns
  const gap = 12
  const cell = (width - gap * (columns - 1)) / columns
  return groups.flatMap((group, g) => {
    const items = group.items.filter((item) => hasText(item.skill))
    const rows = []
    for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns))
    return rows.map((row, r) => ({
      key: `g${g}r${r}`,
      gap: r === 0 && g > 0 ? 5 * v.paragraphs : 2 * v.paragraphs,
      head: [
        r === 0 && hasText(group.name) && (
          <Text key="name" style={{ fontWeight: 'bold', marginBottom: 2 * v.paragraphs }}>{fitWords(group.name, width, textFont(v, true))}</Text>
        ),
        <View key="row" style={{ flexDirection: 'row' }}>
          {row.map((item, i) => (
            <Text key={item.id} style={{ width: cell, marginLeft: i ? gap : 0 }}>{fitWords(skillWithLevel(item), cell, textFont(v))}</Text>
          ))}
        </View>,
      ].filter(Boolean),
      rest: [],
    }))
  })
}

// Skills grouped by category; as comma lists (the category's name first, in bold) or in rows
function skillBlocks(list, ctx) {
  const { v, width } = ctx
  const groups = []
  for (const item of list) {
    if (item.categoryHead || groups.length === 0) groups.push({ name: item.categoryHead ?? '', items: [] })
    groups.at(-1).items.push(item)
  }
  if (ctx.design.skillsDisplay === 'columns') return skillRows(groups, ctx)
  return groups.map((group, i) => {
    const words = group.items
      .filter((item) => hasText(item.skill))
      .map(skillWithLevel)
    return {
      key: `g${i}`,
      gap: 3 * v.paragraphs,
      head: [
        <Text key="line">
          {hasText(group.name) && <Text style={{ fontWeight: 'bold' }}>{group.name}: </Text>}
          {fitWords(words.join(', '), width, textFont(v))}
        </Text>,
      ],
      rest: [],
    }
  })
}

function languageBlocks(list, ctx) {
  const { v, width } = ctx
  return list.filter((item) => hasText(item.language) || hasText(languageLevel(item))).map((item) => ({
    key: item.id,
    gap: 3 * v.paragraphs,
    head: [
      <Text key="line">
        <Text style={{ fontWeight: 'bold' }}>{fitWords(item.language, width, textFont(v, true))}</Text>
        {hasText(languageLevel(item)) && <Text style={{ color: v.muted }}>{hasText(item.language) ? ' — ' : ''}{languageLevel(item)}</Text>}
      </Text>,
    ],
    rest: [],
  }))
}

function textBlocks(text, ctx) {
  const { v } = ctx
  const { head, rest } = splitLines(text, richLines(text, ctx, 3 * v.paragraphs))
  const restGap = { marginTop: 3 * v.paragraphs }
  return [{ key: 'text', gap: 0, head, rest: rest.map((line, i) => <View key={i} style={head.length || i ? restGap : {}}>{line}</View>) }]
}

/** A filled section (see filledSections) as blocks: { key, gap, head: [], rest: [] }. */
export function sectionBlocks({ key, list, text }, ctx) {
  const { v, width } = ctx
  if (!list) return textBlocks(text, ctx)
  if (key === 'skills') return skillBlocks(list, ctx)
  if (key === 'languages') return languageBlocks(list, ctx)
  if (commaField[key]) {
    const words = list.map((item) => item[commaField[key]]).filter(hasText)
    return [{ key: 'list', gap: 0, head: [<Text key="line">{fitWords(words.join(', '), width, textFont(v))}</Text>], rest: [] }]
  }
  return list.map((item) => entryBlock(key, item, ctx))
}

/** The personal details beyond contact ('Fecha de nacimiento: …'), in two columns or one. */
export function detailsBlocks(lines, ctx, columns = 2) {
  const { v, width } = ctx
  if (columns === 1) {
    return lines.map((line, i) => ({
      key: `d${i}`,
      gap: 2 * v.paragraphs,
      head: [<Text key="line">{fitWords(line, width, textFont(v))}</Text>],
      rest: [],
    }))
  }
  const half = (width - 16) / 2
  return [{
    key: 'details',
    gap: 0,
    head: [
      <View key="grid" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {lines.map((line, i) => (
          <Text key={i} style={{ width: half, marginTop: i > 1 ? 2 * v.paragraphs : 0 }}>{fitWords(line, half, textFont(v))}</Text>
        ))}
      </View>,
    ],
    rest: [],
  }]
}
