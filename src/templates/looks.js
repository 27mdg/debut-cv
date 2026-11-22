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
]

// The first templates, replaced by looks: a saved CV that used one opens with the closest look
export const oldTemplateLooks = {
  minimal: 'sobrio',
  arch: 'nitido',
  banner: 'horizonte',
  contrast: 'nocturno',
  timeline: 'recorrido',
}

/** A look's entry by id, or undefined. */
export function lookInfo(id) {
  return looks.find((look) => look.id === id)
}

export default looks
