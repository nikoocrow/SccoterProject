import { useEffect, useState } from 'react'

const EXIT_MS = 450

// Title + copy in the right column. When `content` changes, the current text
// animates out, then the new one animates in letter by letter.
export function InfoPanel({ content }) {
  const [shown, setShown] = useState(content)
  const leaving = content.id !== shown.id

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setShown(content), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving, content])

  return (
    <div key={shown.id} className={`info${leaving ? ' is-leaving' : ''}`} aria-live="polite">
      <h2 aria-label={shown.title}>
        {shown.title.split(' ').map((word, w, words) => (
          <span key={w} className="info__word" aria-hidden="true">
            {[...word].map((ch, i) => (
              <span key={i} className="info__char" style={{ '--i': w * 6 + i }}>
                {ch}
              </span>
            ))}
            {w < words.length - 1 && ' '}
          </span>
        ))}
      </h2>
      {shown.body.map((text, i) => (
        <p key={i} className={`info__text${i > 0 ? ' fade' : ''}`} style={{ '--i': i }}>
          {text}
        </p>
      ))}
    </div>
  )
}
