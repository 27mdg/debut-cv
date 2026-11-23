import texts from '../../locales/index.js'
import { designValues, fontFamilies, fonts } from '../../data/design.js'

// Page sizes in points
const pageSizes = { A4: [595.28, 841.89], LETTER: [612, 792] }

function fontList(id, fallback) {
  const font = fonts.find((f) => f.id === id)
  return font ? fontFamilies(font) : fallback
}

/**
 * Everything a layout needs from cv.design, already turned into numbers and colours:
 * designValues() plus the page, the heading font and the colours each option asks for.
 */
export function engineValues(design, look) {
  const v = designValues(design, look)
  const pageSize = design.pageSize || texts.common.paperSize
  const [pageWidth, pageHeight] = pageSizes[pageSize] ?? pageSizes.A4
  const ink = '#222222'
  return {
    ...v,
    pageSize,
    pageWidth,
    pageHeight,
    textSize: 10 * v.scale,
    smallSize: 9 * v.scale,
    marginX: 50 * v.margins,
    marginY: 42 * v.margins,
    headingFont: fontList(design.headingFont, v.font),
    ink,
    muted: '#5f5f5f',
    nameColor: design.accentName ? v.accentText : ink,
    titleColor: design.accentTitles ? v.accentText : ink,
    lineColor: design.accentLines ? v.accent : ink,
    linkColor: design.accentLinks ? v.accentText : 'inherit',
  }
}

/** Every font family a CV's PDF draws with, so they can be loaded before drawing. */
export function engineFamilies(design, look) {
  const v = engineValues(design, look)
  return [...new Set([...v.font, ...v.headingFont])]
}

/** The page's own style: margins, and the text every part inherits. */
export function pageStyle(v) {
  return {
    paddingTop: v.marginY,
    paddingBottom: v.marginY,
    paddingHorizontal: v.marginX,
    fontFamily: v.font,
    fontSize: v.textSize,
    lineHeight: v.lineHeight,
    color: v.ink,
  }
}

/** Space between a margin column and the content beside it, in points. */
export const marginGap = 18

/** The body text's font, as measure.js takes it. */
export function textFont(v, bold = false) {
  return { family: v.font[0], size: v.textSize, bold }
}
