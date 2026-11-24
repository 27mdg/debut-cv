import { useRef } from 'react'

const keySteps = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * A choice drawn as small pictures, one tile per option, as a radio group: the arrow keys move
 * the choice, Tab enters and leaves the group. `options`: [{ value, label, picture }].
 */
function OptionTiles({ label, options, value, onChange }) {
  const buttons = useRef([])

  function handleKeyDown(e, index) {
    const step = keySteps[e.key]
    if (!step) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    buttons.current[next].focus()
  }

  return (
    <div className="option-tiles" role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const chosen = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => { buttons.current[index] = element }}
            type="button"
            role="radio"
            aria-checked={chosen}
            // Only the chosen one is reached with Tab; the arrows go to the others
            tabIndex={chosen ? 0 : -1}
            className={chosen ? 'option-tile chosen' : 'option-tile'}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className="option-picture">{option.picture}</span>
            <span className="option-label">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default OptionTiles
