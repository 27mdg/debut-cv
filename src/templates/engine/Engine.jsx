import { CvDocument } from './page.jsx'
import { engineValues } from './values.js'
import SingleColumn from './layouts/single.jsx'
import MarginColumn from './layouts/margin.jsx'

// One component per layout (designChoices.layout); the sidebar one comes next
const layouts = { single: SingleColumn, margin: MarginColumn }

/** A look's PDF: its layout drawn with the CV's customizer values. */
export default function Engine({ cv, look }) {
  const v = engineValues(cv.design, look)
  const Layout = layouts[cv.design.layout] ?? SingleColumn
  return (
    <CvDocument cv={cv}>
      <Layout cv={cv} v={v}/>
    </CvDocument>
  )
}
