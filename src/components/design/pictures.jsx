// Tiny pages for the option tiles: grey lines are text, the darker ones titles, the tinted area
// a coloured fill. Drawn by hand, like the other icons.

function Page({ children }) {
  return (
    <svg viewBox="0 0 40 52" width="40" height="52" aria-hidden="true">
      <rect className="pic-sheet" x="0.5" y="0.5" width="39" height="51" rx="2"/>
      {children}
    </svg>
  )
}

// Text lines from `y` down, `count` of them, between x1 and x2
function Lines({ x1, x2, y, count, gap = 4 }) {
  return Array.from({ length: count }, (_, i) => (
    <line key={i} className="pic-text" x1={x1} x2={i === count - 1 ? x1 + (x2 - x1) * 0.6 : x2} y1={y + i * gap} y2={y + i * gap}/>
  ))
}

function Title({ x, y, width = 9 }) {
  return <line className="pic-title" x1={x} x2={x + width} y1={y} y2={y}/>
}

// The contact details under the name: short pieces in one line, two lines or a column
export function ContactPicture({ layout }) {
  const piece = (x, y, width) => <line key={`${x}-${y}`} className="pic-strong" x1={x} x2={x + width} y1={y} y2={y}/>
  const pieces = {
    row: [piece(5, 16, 6), piece(13, 16, 8), piece(23, 16, 5), piece(30, 16, 5)],
    rows: [piece(5, 16, 8), piece(15, 16, 10), piece(27, 16, 6), piece(5, 20, 12)],
    column: [piece(5, 16, 10), piece(5, 20, 14), piece(5, 24, 9), piece(5, 28, 12)],
  }[layout]
  return (
    <Page>
      <Title x={5} y={8} width={18}/>
      {pieces}
      <Lines x1={5} x2={35} y={layout === 'column' ? 38 : 30} count={layout === 'column' ? 2 : 4}/>
    </Page>
  )
}

export function LayoutPicture({ layout }) {
  if (layout === 'margin') {
    return (
      <Page>
        <Title x={5} y={8} width={18}/>
        <Title x={5} y={18} width={7}/><Lines x1={16} x2={35} y={18} count={3}/>
        <Title x={5} y={33} width={7}/><Lines x1={16} x2={35} y={33} count={3}/>
      </Page>
    )
  }
  if (layout === 'sidebar') {
    return (
      <Page>
        <Title x={5} y={8} width={18}/>
        <rect className="pic-fill" x="1" y="13" width="13" height="38"/>
        <Lines x1={4} x2={11} y={19} count={3}/>
        <Lines x1={4} x2={11} y={34} count={2}/>
        <Title x={18} y={19}/><Lines x1={18} x2={35} y={24} count={2}/>
        <Title x={18} y={35}/><Lines x1={18} x2={35} y={40} count={2}/>
      </Page>
    )
  }
  return (
    <Page>
      <Title x={5} y={8} width={18}/>
      <Title x={5} y={17}/><Lines x1={5} x2={35} y={22} count={2}/>
      <Title x={5} y={32}/><Lines x1={5} x2={35} y={37} count={3}/>
    </Page>
  )
}
