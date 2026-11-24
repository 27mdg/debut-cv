import { memo } from 'react'
import texts from '../../locales/index.js'
import { designChoices } from '../../data/design.js'
import { isCustomized, lookInfo } from '../../templates/looks.js'
import { ArrowIcon, LayoutIcon, PersonIcon } from '../Icons.jsx'
import { Thumbnail } from '../TemplatePicker.jsx'
import Segmented from '../Segmented.jsx'
import OptionTiles from './OptionTiles.jsx'
import { ContactPicture, LayoutPicture } from './pictures.jsx'

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

// A Segmented for one design option; `labels` names each of its values (an object, or an array
// for the steps 1, 2, 3)
function Choice({ name, title, labels, design, onChange }) {
  const label = (value) => (Array.isArray(labels) ? labels[value - 1] : labels[value])
  return (
    <Option title={title}>
      <Segmented label={title} value={design[name]} onChange={(value) => onChange(name, value)}
        options={designChoices[name].map((value) => ({ value, label: label(value) }))}/>
    </Option>
  )
}

function Header({ design, onChange }) {
  const t = texts.design
  const contactLayouts = designChoices.contactLayout.map((value) => ({
    value, label: t.contactLayouts[value], picture: <ContactPicture layout={value}/>,
  }))
  // The separator parts the contact details (icons do that themselves) and the inline job title
  const separated = !design.contactIcons || design.jobTitlePlace === 'inline'
  const separators = { dot: '·', bar: '|', bullet: '•' }
  return (
    <>
      <Choice name="headerAlign" title={t.headerAlign} labels={t.aligns} design={design} onChange={onChange}/>
      <Choice name="nameSize" title={t.nameSize} labels={t.sizes} design={design} onChange={onChange}/>
      <Choice name="jobTitlePlace" title={t.jobTitlePlace} labels={t.jobTitlePlaces} design={design} onChange={onChange}/>
      <Option title={t.contactLayout}>
        <OptionTiles label={t.contactLayout} options={contactLayouts} value={design.contactLayout}
          onChange={(value) => onChange('contactLayout', value)}/>
        <label className="switch-label design-switch">
          <span>{t.contactIcons}</span>
          <input type="checkbox" role="switch" className="toggle" checked={design.contactIcons}
            onChange={(e) => onChange('contactIcons', e.target.checked)}/>
        </label>
      </Option>
      {separated && (
        <Option title={t.contactSeparator}>
          <Segmented label={t.contactSeparator} value={design.contactSeparator} onChange={(value) => onChange('contactSeparator', value)}
            options={designChoices.contactSeparator.map((value) => ({
              value, label: <span className="separator-glyph">{separators[value]}</span>, name: t.separatorNames[value],
            }))}/>
        </Option>
      )}
      <Option title={t.linkStyle}>
        <p className="menu-note">{t.linkNote}</p>
        <Segmented label={t.linkStyle} value={design.linkStyle} onChange={(value) => onChange('linkStyle', value)}
          options={designChoices.linkStyle.map((value) => ({ value, label: t.linkStyles[value] }))}/>
      </Option>
      <Choice name="headerFill" title={t.headerFill} labels={t.fills} design={design} onChange={onChange}/>
    </>
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
          <Choice name="sidebarSide" title={t.sidebarSide} labels={t.sides} design={design} onChange={onChange}/>
          <Choice name="sidebarWidth" title={t.sidebarWidth} labels={t.widths} design={design} onChange={onChange}/>
          <Choice name="sidebarFill" title={t.sidebarFill} labels={t.fills} design={design} onChange={onChange}/>
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
          <>
            <Group title={t.groups.structure} icon={LayoutIcon} open>
              <Structure design={design} sections={sections} onChange={onChange}/>
            </Group>
            <Group title={t.groups.header} icon={PersonIcon}>
              <Header design={design} onChange={onChange}/>
            </Group>
          </>
        ) : (
          <p className="menu-note design-old">{t.oldTemplate}</p>
        )}
      </div>
    </aside>
  )
}

// memo: the CV changes on every keystroke, its design much less often
export default memo(DesignPanel)
