import { Suspense, lazy, useEffect, useState } from 'react'
import { COLORWAYS } from '../data/colors'
import { HOTSPOTS } from '../data/hotspots'
import { INFO, LANGS, UI, detectLang, saveLang } from '../i18n'
import { Credits } from './Credits'
import { InfoPanel } from './InfoPanel'
import { PoseSwitch } from './PoseSwitch'
import { Toggle } from './Toggle'

// three.js + the scene load in their own chunk so the page text paints first.
const ScooterScene = lazy(() => import('./ScooterScene').then((m) => ({ default: m.ScooterScene })))

const POSES = ['static', 'ride', 'park', 'fold']

// Right-column copy: a focused hotspot wins, then the pose the visitor picked, then the intro.
function infoFor({ focusId, pose, poseChosen, lang }) {
  const h = HOTSPOTS.find((h) => h.id === focusId)
  if (h) return { id: `${h.id}:${lang}`, title: h.label[lang], body: [h.body[lang]] }
  const key = poseChosen && INFO[pose] ? pose : 'intro'
  return { id: `${key}:${lang}`, ...INFO[key][lang] }
}

export function Hero() {
  const [lang, setLang] = useState(detectLang)
  const [showHotspots, setShowHotspots] = useState(false)
  const [focusId, setFocusId] = useState(null)
  const [colorIndex, setColorIndex] = useState(0)
  const colorway = COLORWAYS[colorIndex]
  const [pose, setPoseState] = useState('park')
  const [poseChosen, setPoseChosen] = useState(false)
  const t = UI[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    saveLang(lang)
  }, [lang])

  // Hotspots only work on the rest pose, so the Details toggle lives in "static" only.
  const isStatic = pose === 'static'

  const setPose = (next) => {
    setPoseState(next)
    setPoseChosen(true)
    if (next !== 'static') setShowHotspots(false)
  }

  // Double-click on the scooter area steps to the next pose.
  const handleDoubleClick = (e) => {
    if (e.target.closest('a, button, label, .hero__left, .hero__right, .hero__nav')) return
    setPose(POSES[(POSES.indexOf(pose) + 1) % POSES.length])
  }

  return (
    <section className="hero" onDoubleClick={handleDoubleClick}>
      <h1 className="hero__word" aria-hidden="true">Scooter</h1>

      <div className="hero__canvas">
        <Suspense fallback={null}>
          <ScooterScene
            tint={colorway.tint}
            pose={pose}
            lang={lang}
            hotspotsEnabled={showHotspots && isStatic}
            onFocusChange={setFocusId}
          />
        </Suspense>
      </div>

      <header className="hero__nav">
        <a className="logo" href="#">
          <span className="logo__mark">✱</span> Scooter
        </a>
        <Credits t={t} />
      </header>

      <aside className="hero__left">
        <p className="meta">
          {t.year} <span className="line" /> <strong>2026</strong>
        </p>
        <PoseSwitch
          label={t.pose}
          options={POSES.map((id) => ({ id, label: t.poses[id] }))}
          value={pose}
          onChange={setPose}
        />
        {isStatic && <Toggle label={t.details} checked={showHotspots} onChange={setShowHotspots} />}
      </aside>

      <div className="hero__right">
        <div className="colors">
          <ul className="dots" aria-label={t.colors}>
            {COLORWAYS.map((c, i) => (
              <li key={c.id}>
                <button
                  className={`dot${i === colorIndex ? ' is-active' : ''}`}
                  style={{ '--c': c.swatch }}
                  aria-label={c.name[lang]}
                  aria-pressed={i === colorIndex}
                  title={c.name[lang]}
                  onClick={() => setColorIndex(i)}
                />
              </li>
            ))}
          </ul>
          <p key={`${colorway.id}:${lang}`} className="colors__name">{colorway.name[lang]}</p>
        </div>
        <InfoPanel content={infoFor({ focusId, pose, poseChosen, lang })} />
      </div>

      <footer className="hero__footer">
        <span>{t.scroll}</span>
        <nav className="lang" aria-label={t.language}>
          {LANGS.map((l, i) => (
            <span key={l} className="lang__item">
              {i > 0 && <i aria-hidden="true" />}
              <button
                className={l === lang ? 'is-active' : ''}
                aria-pressed={l === lang}
                lang={l}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </nav>
      </footer>
    </section>
  )
}
