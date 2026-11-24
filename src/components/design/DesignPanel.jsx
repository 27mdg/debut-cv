import { memo } from 'react'
import texts from '../../locales/index.js'
import { designChoices } from '../../data/design.js'
import { isCustomized, lookInfo } from '../../templates/looks.js'
import { ArrowIcon, LayoutIcon } from '../Icons.jsx'
import { Thumbnail } from '../TemplatePicker.jsx'
import Segmented from '../Segmented.jsx'
import OptionTiles from './OptionTiles.jsx'
import { LayoutPicture } from './pictures.jsx'

function Group({ title, icon: Icon, open, children }) {
  return (
    <details className="section design-group" open={open}>
      <summary>
        <span className="section-icon"><Icon/></span>
        <div className="section-heading"><h2><span className="section-title">{title}</span></h2></div>
        <span className="section-arrow"><ArrowIcon/></span>
      </summary>
      <div className="section-content">{children}</div>
    </details>
  )
}

function Option({ title, children }) {
  return (
    <div className="design-option">
      <span className="menu-subtitle">{title}</span>
      {children}
    </div>
  )
}

function Structure({ design, sections, onChange }) {
  const t = texts.design
  const layouts = designChoices.layout.map((value) => ({
    value, label: t.layouts[value], picture: <LayoutPicture layout={value}/>,
  }))

  function toggleSection(key, on) {
    const rest = design.sidebarSections.filter((k) => k !== key)
    onChange('sidebarSections', on ? [...rest, key] : rest)
  }

  return (
    <>
      <Option title={t.layout}>
        <OptionTiles label={t.layout} options={layouts} value={design.layout} onChange={(value) => onChange('layout', value)}/>
      </Option>
      {design.layout === 'sidebar' && (
        <>
          <Option title={t.sidebarSide}>
            <Segmented label={t.sidebarSide} value={design.sidebarSide} onChange={(value) => onChange('sidebarSide', value)}
              options={designChoices.sidebarSide.map((value) => ({ value, label: t.sides[value] }))}/>
          </Option>
          <Option title={t.sidebarWidth}>
            <Segmented label={t.sidebarWidth} value={design.sidebarWidth} onChange={(value) => onChange('sidebarWidth', value)}
              options={designChoices.sidebarWidth.map((value) => ({ value, label: t.widths[value - 1] }))}/>
          </Option>
          <Option title={t.sidebarFill}>
            <Segmented label={t.sidebarFill} value={design.sidebarFill} onChange={(value) => onChange('sidebarFill', value)}
              options={designChoices.sidebarFill.map((value) => ({ value, label: t.fills[value] }))}/>
          </Option>
          <Option title={t.sidebarSections}>
            <p className="menu-note">{sections.length ? t.sidebarNote : t.noSections}</p>
            {sections.map(({ key, title }) => (
              <label key={key} className="switch-label design-switch">
                <span>{title}</span>
                <input type="checkbox" role="switch" className="toggle"
                  checked={design.sidebarSections.includes(key)} onChange={(e) => toggleSection(key, e.target.checked)}/>
              </label>
            ))}
          </Option>
        </>
      )}
    </>
  )
}

/**
 * «Modo diseño»: the customizer beside the full-screen preview. `sections`: the CV's filled
 * sections [{ key, title }], for the sidebar's switches.
 */
function DesignPanel({ template, design, sections, onChange, onReset, onClose }) {
  const t = texts.design
  const look = lookInfo(template)
  const name = texts.templates[template] ?? template
  const customized = look && isCustomized(design, look)

  return (
    <aside className="design-panel" aria-label={t.title}>
      <header className="design-head">
        <h2>{t.title}</h2>
        <button type="button" className="btn btn-primary btn-small" data-hint={t.doneHint} onClick={onClose}>{t.done}</button>
      </header>
      <div className="design-scroll">
        <div className="design-look">
          <Thumbnail id={template}/>
          <div className="design-look-text">
            <b>{name}</b>
            {look && <small>{texts.templateGroups[look.group]} · {t.layouts[look.design.layout]}</small>}
            {customized && <span className="section-badge">{t.custom}</span>}
          </div>
          {look && (
            <button type="button" className="btn btn-ghost btn-small design-reset" disabled={!customized}
              data-hint={t.resetHint(name)} onClick={onReset}>
              {t.reset}
            </button>
          )}
        </div>
        {look ? (
          <Group title={t.groups.structure} icon={LayoutIcon} open>
            <Structure design={design} sections={sections} onChange={onChange}/>
          </Group>
        ) : (
          <p className="menu-note design-old">{t.oldTemplate}</p>
        )}
      </div>
    </aside>
  )
}

// memo: the CV changes on every keystroke, its design much less often
export default memo(DesignPanel)
