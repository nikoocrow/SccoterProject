import { useEffect, useId, useRef, useState } from 'react'

// "Credits" pill in the nav that opens an author card below it.
export function Credits({ t }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const cardId = useId()

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="credits" ref={rootRef} onPointerDown={(e) => e.stopPropagation()}>
      <button
        className={`credits__button${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls={cardId}
        onClick={() => setOpen((o) => !o)}
      >
        {t.credits}
      </button>

      <div
        id={cardId}
        className={`credits__card${open ? ' is-open' : ''}`}
        role="dialog"
        aria-label={t.credits}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="credits__avatar">
          <img src="/avatar.jpg" alt="nikocrow" width="72" height="72" />
        </div>
        <div className="credits__body">
          <p className="credits__name">nikocrow</p>
          <p className="credits__role">{t.creditsRole}</p>
          <a className="credits__link" href="https://nikocrow.dev" target="_blank" rel="noopener noreferrer">
            nikocrow.dev <span aria-hidden="true">↗</span>
          </a>
          <p className="credits__made">{t.creditsMade}</p>
        </div>
      </div>
    </div>
  )
}
