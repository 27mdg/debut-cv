import { Font } from '@react-pdf/renderer'

// react-pdf only breaks lines at spaces, so a word wider than its column (a long email, web
// address or compound word) runs off the page. Words are measured here with the real font and
// split before drawing. The fonts are loaded first (prepareFonts); until then nothing is measured.

const weights = [400, 700]

/** Loads both weights of each family, so their widths can be measured while drawing. */
export async function prepareFonts(families) {
  await Promise.all(families.flatMap((fontFamily) => weights.map((fontWeight) => (
    // A font that fails to load is only not measured; react-pdf reports the failure itself
    Font.load({ fontFamily, fontWeight }).catch(() => {})
  ))))
}

function loadedFont(family, bold) {
  try {
    return Font.getFont({ fontFamily: family, fontWeight: bold ? 700 : 400 })?.data ?? null
  } catch {
    return null
  }
}

/** Width of `text` in points, or null while its font is not loaded. */
export function textWidth(text, { family, size, bold = false }) {
  const font = loadedFont(family, bold)
  if (!font) return null
  // The fonts built into every PDF reader (Helvetica) are measured by their own metrics
  if (font.type === 'STANDARD') return font.src.widthOfString(text, size)
  return (font.layout(text).advanceWidth * size) / font.unitsPerEm
}

// Where a long word breaks best: after these characters (ana.garcia@ / correo. / ejemplo.com/)
const breakPoints = /(?<=[@./\\\-_?&=:])/

// Splits `piece` into lines that fit `width`, letter by letter (only if nothing else works)
function byLetters(piece, width, font) {
  const lines = []
  let line = ''
  for (const letter of piece) {
    if (line && textWidth(line + letter, font) > width) {
      lines.push(line)
      line = letter
    } else {
      line += letter
    }
  }
  return [...lines, line]
}

function splitWord(word, width, font) {
  const lines = []
  let line = ''
  for (const piece of word.split(breakPoints)) {
    if (textWidth(line + piece, font) <= width) {
      line += piece
      continue
    }
    if (line) lines.push(line)
    if (textWidth(piece, font) <= width) {
      line = piece
    } else {
      const letters = byLetters(piece, width, font)
      line = letters.pop()
      lines.push(...letters)
    }
  }
  return [...lines, line].join('\n')
}

/**
 * `text` with a line break inside every word too wide for `width` points, at its natural break
 * points (after @ . / -), never with an added hyphen. Unchanged while the font is not loaded.
 * `font`: { family, size, bold }.
 */
export function fitWords(text, width, font) {
  if (!text || width <= 0 || textWidth('a', font) === null) return text
  return text.split(/(\s+)/).map((word) => (
    word.trim() === '' || textWidth(word, font) <= width ? word : splitWord(word, width, font)
  )).join('')
}

/**
 * The font size at which a single line `text` fits `width`, shrinking down to `minimum` times
 * `font.size` at most (what is still too wide then is split by fitWords).
 */
export function fittingSize(text, width, font, minimum = 0.85) {
  const measured = textWidth(text, font)
  if (measured === null || measured <= width) return font.size
  return Math.max(font.size * minimum, (font.size * width) / measured)
}
