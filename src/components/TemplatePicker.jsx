import { useEffect, useRef, useState } from 'react'
import texts from '../locales/index.js'
import templates from '../templates/list.js'
import { prefersReducedMotion } from './useLeaving.js'
import Segmented from './Segmented.jsx'
import { TuneIcon } from './Icons.jsx'

const thumbnailWidth = 150

/** The first page of a template filled with the sample CV, drawn once it scrolls into view. */
export function Thumbnail({ id }) {
  const box = useRef(null)
  const [src, setSrc] = useState(null)

  // Drawn only when the card scrolls into view: with many templates, drawing them all at once is slow
  useEffect(() => {
    let cancelled = false
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      try {
        const { templateThumbnail } = await import('../templates/thumbnail.js')
        const image = await templateThumbnail(id, thumbnailWidth)
        if (!cancelled) setSrc(image)
      } catch (e) {
        console.error(e)
      }
    })
    observer.observe(box.current)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [id])

  return (
    <span className="template-thumbnail" ref={box}>
      {src && <img src={src} alt=""/>}
    </span>
  )
}

// A wheel turn this big (in px) moves one template; touchpads send many small turns that add up
const wheelStep = 60

// The vertical wheel scrolls the strip sideways (down = right), one template per step. At either
// end it is left alone, so the page goes on scrolling. A React onWheel cannot stop the page
// scrolling (it is passive), hence the listener.
function useWheelSideways(strip) {
  useEffect(() => {
    const element = strip.current
    let pending = 0
    function handleWheel(e) {
      if (e.ctrlKey || e.shiftKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return
      const direction = Math.sign(e.deltaY)
      const atEnd = direction > 0
        ? element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
        : element.scrollLeft <= 0
      if (atEnd) return
      e.preventDefault()
      // Lines (some mice) to px
      pending += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (Math.abs(pending) < wheelStep) return
      pending = 0
      const card = element.firstElementChild
      const gap = parseFloat(getComputedStyle(element).columnGap) || 0
      element.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [strip])
}

// The tabs: every group that has a look, in this order. The first templates have no group and
// only show under «Todas».
const groupOrder = ['classic', 'modern', 'compact', 'creative']
const groups = ['all', ...groupOrder.filter((group) => templates.some((t) => t.group === group))]

// onCustomize: opens «Modo diseño»; left out while it is open
function TemplatePicker({ selected, onSelect, onCustomize }) {
  const strip = useRef(null)
  useWheelSideways(strip)
  const [group, setGroup] = useState('all')
  const shown = group === 'all' ? templates : templates.filter((t) => t.group === group)

  return (
    <>
      <div className="template-picker-head">
        <Segmented label={texts.tools.templates} value={group} onChange={setGroup}
          options={groups.map((value) => ({ value, label: texts.templateGroups[value] }))}/>
        {onCustomize && (
          <button type="button" className="btn btn-primary btn-small" onClick={onCustomize}>
            <TuneIcon/>{texts.design.customize}
          </button>
        )}
      </div>
      <div className="template-picker" ref={strip}>
        {shown.map(({ id }) => (
          <button
            key={id}
            type="button"
            className={id === selected ? 'template-card selected' : 'template-card'}
            aria-pressed={id === selected}
            onClick={() => onSelect(id)}
          >
            <Thumbnail id={id}/>
            <span className="template-name">{texts.templates[id]}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export default TemplatePicker
