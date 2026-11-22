import { CvDocument } from './page.jsx'
import { engineValues } from './values.js'
import SingleColumn from './layouts/single.jsx'

// One component per layout (designChoices.layout); the margin and sidebar ones come next
const layouts = { single: SingleColumn }

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
