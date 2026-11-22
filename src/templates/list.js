import looks from './looks.js'

// Everything the picker offers, in its order: the new looks (drawn by the engine in engine/),
// then the first templates, which go once every look exists. The first one is the default.
// Separate from document.jsx so the toolbar does not load the PDF library.
// To add a template: create src/templates/designs/<id>.jsx, add a line here and its name in es.js.
// defaultColor: an id from `colors` and defaultFont: an id from `fonts` (src/data/design.js).
const templates = [
  ...looks,
  { id: 'arch', defaultColor: 'taupe', defaultFont: 'arimo' },
  { id: 'banner', defaultColor: 'forest', defaultFont: 'poppins' },
  { id: 'timeline', defaultColor: 'forest', defaultFont: 'montserrat' },
  { id: 'contrast', defaultColor: 'black', defaultFont: 'raleway' },
  { id: 'minimal', defaultColor: 'forest', defaultFont: 'raleway' },
]

export function templateInfo(id) {
  return templates.find((t) => t.id === id) ?? templates[0]
}

export default templates
