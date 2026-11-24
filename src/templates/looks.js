import initialCv from '../data/initialCv.js'
import { designChoices } from '../data/design.js'

// The ready-made looks of the template picker. A look is not code: it is a layout plus the
// customizer values that differ from the defaults (initialCv.js), with its own colour and font.
// No PDF library here, so the toolbar can read it.
// group: 'classic', 'modern', 'compact' or 'creative' (the picker's tabs).
// defaultColor: an id from `colors`, defaultFont: an id from `fonts` (src/data/design.js).
const looks = [
  {
    id: 'sobrio',
    group: 'classic',
    defaultColor: 'charcoal',
    defaultFont: 'lato',
    design: { layout: 'single', titleStyle: 'underline', titleCase: 'upper' },
  },
  {
    id: 'europeo',
    group: 'classic',
    defaultColor: 'navy',
    defaultFont: 'open-sans',
    design: { layout: 'margin', marginContent: 'titles', titleStyle: 'plain', titleCase: 'upper', titleSize: 1 },
  },
  {
    id: 'nitido',
    group: 'modern',
    defaultColor: 'teal',
    defaultFont: 'roboto',
    design: { layout: 'sidebar', sidebarSide: 'left', sidebarFill: 'soft', skillsDisplay: 'columns', skillsColumns: 1 },
  },
]

// The first templates, replaced by looks: a saved CV that used one opens with the closest look
export const oldTemplateLooks = {
  minimal: 'sobrio',
  arch: 'nitido',
  banner: 'horizonte',
  contrast: 'nocturno',
  timeline: 'recorrido',
}

/**
 * `design` dressed as the look: every customizer option back to its default, then the look's
 * own values. Font and colour go back to the look's; size, spacing and date format stay the user's.
 */
export function withLook(design, look) {
  const options = Object.fromEntries(Object.keys(designChoices).map((name) => [name, initialCv.design[name]]))
  return { ...design, ...options, sidebarSections: initialCv.design.sidebarSections, ...look.design, color: '', font: '' }
}

/** Whether `design` differs from the look's own (its options, colour or font were changed). */
export function isCustomized(design, look) {
  const original = withLook(design, look)
  const names = [...Object.keys(designChoices), 'sidebarSections', 'color', 'font']
  // The sidebar's sections are a set: their order in the list means nothing
  const plain = (value) => JSON.stringify(Array.isArray(value) ? [...value].sort() : value)
  return names.some((name) => plain(design[name]) !== plain(original[name]))
}

/** A look's entry by id, or undefined. */
export function lookInfo(id) {
  return looks.find((look) => look.id === id)
}

export default looks
