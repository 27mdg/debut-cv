import texts from '../locales/index.js'
import templates, { templateInfo } from './list.js'
import { lookInfo } from './looks.js'
import './fonts.js'
import { shownCv } from './format.js'
import Engine from './engine/Engine.jsx'
import { engineFamilies } from './engine/values.js'
import { prepareFonts } from './engine/measure.js'

// Every file in designs/ is a template whose id is its file name, so adding one
// does not require importing it here. Looks are drawn by the engine instead.
const files = import.meta.glob('./designs/*.jsx', { eager: true, import: 'default' })
const components = Object.fromEntries(
  Object.entries(files).map(([path, component]) => [path.match(/([^/]+)\.jsx$/)[1], component]),
)

if (import.meta.env.DEV) {
  for (const { id } of templates) {
    if (!components[id] && !lookInfo(id)) console.warn(`Template "${id}" is in list.js but has no file in designs/`)
    if (!texts.templates[id]) console.warn(`Template "${id}" has no name in es.js (texts.templates)`)
  }
}

/**
 * Loads what the PDF of `cv` needs before drawing it: the engine measures long words with its
 * fonts. Call it, and wait, before cvDocument.
 */
export async function prepareCv(cv) {
  const look = lookInfo(cv.template)
  if (look) await prepareFonts(engineFamilies(cv.design, look))
}

// Shared by preview, download and thumbnails, so they always match
export function cvDocument(cv) {
  const look = lookInfo(cv.template)
  if (look) return <Engine cv={shownCv(cv)} look={look}/>
  const template = templateInfo(cv.template)
  const Template = components[template.id]
  return <Template cv={shownCv(cv)} template={template}/>
}
