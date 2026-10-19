import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { ScooterModel } from './ScooterModel'
import { HOTSPOTS } from '../data/hotspots'
import { UI } from '../i18n'

// Base 3/4 view, matching the reference shot.
const BASE_ROTATION_Y = -0.6
const ORBIT_TARGET = [0, 1.12, 0]
const BASE_DISTANCE = 6.4
const HOME_DIR = new THREE.Vector3(0, 1.5 - ORBIT_TARGET[1], 6.4).normalize()
const FOCUS_DISTANCE = 2.1
const TRANSITION = 1.3 // seconds
const DRAG_THRESHOLD = 5 // px a pointer must travel before it counts as a drag

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const ANCHORED = HOTSPOTS.filter((h) => h.part)

function FloatingScooter({ tint, pose, lang, hotspotsEnabled, showHotspots, onSelect }) {
  const ref = useRef()
  const anchorsRef = useRef({})
  // Mount the hotspots the first time Details is turned on, once the scene is settled.
  // Mounting drei <Html> while the scene is still suspending/revealing can leave the
  // first one's root unmounted (its DOM node disappears).
  const [hotspotsMounted, setHotspotsMounted] = useState(false)
  if (hotspotsEnabled && !hotspotsMounted) setHotspotsMounted(true)

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    // Slow idle sway; the user drives the view with OrbitControls.
    // The static pose eases back to rest and holds still.
    const still = pose === 'static'
    const targetRotY = still ? BASE_ROTATION_Y : BASE_ROTATION_Y + Math.sin(t * 0.4) * 0.05
    const targetY = still ? 0 : Math.sin(t * 0.8) * 0.03
    const damp = (from, to) => {
      const v = THREE.MathUtils.damp(from, to, 4, delta)
      return Math.abs(v - to) < 1e-5 ? to : v
    }
    g.rotation.y = damp(g.rotation.y, targetRotY)
    g.position.y = damp(g.position.y, targetY)
  })

  return (
    <group ref={ref} position-x={-0.15} rotation-y={BASE_ROTATION_Y}>
      <ScooterModel height={2.35} tint={tint} pose={pose} anchors={ANCHORED} anchorsRef={anchorsRef} />
      {hotspotsMounted && HOTSPOTS.map((h) => (
        <Hotspot
          key={h.id}
          id={h.id}
          position={h.position}
          label={h.label[lang]}
          viewText={UI[lang].view}
          anchorsRef={anchorsRef}
          visible={showHotspots}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}

function Hotspot({ id, label, viewText, position, anchorsRef, visible, onSelect }) {
  const ref = useRef()

  // Follow the rig part this hotspot is pinned to (e.g. the handlebar when steering).
  useFrame(() => {
    const anchor = anchorsRef.current[id]
    const g = ref.current
    if (!anchor || !g?.parent) return
    g.position.copy(anchor.local)
    anchor.node.localToWorld(g.position)
    g.parent.worldToLocal(g.position)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(id, ref.current.getWorldPosition(new THREE.Vector3()))
  }

  return (
    <group ref={ref} position={position}>
      <Html center zIndexRange={[20, 10]}>
        <button
          className={`hotspot${visible ? '' : ' is-hidden'}`}
          aria-label={`${viewText} ${label}`}
          tabIndex={visible ? 0 : -1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleClick}
        >
          <span className="hotspot__label">{label}</span>
        </button>
      </Html>
    </group>
  )
}

// Animates the camera + orbit target between the home view and a focused hotspot.
// While focused, OrbitControls orbits around the hotspot instead of the scooter center.
function CameraRig({ focus, onSettled }) {
  const { camera, size, controls } = useThree()
  const anim = useRef(null)
  // Pull the camera back on narrow (portrait) viewports so the scooter fits.
  const homeDistance = BASE_DISTANCE * Math.max(1, 1.25 / (size.width / size.height))

  useEffect(() => {
    if (!controls) return
    const toTarget = focus ? focus.clone() : new THREE.Vector3(...ORBIT_TARGET)
    const dir = focus ? camera.position.clone().sub(controls.target).normalize() : HOME_DIR.clone()
    anim.current = {
      t: 0,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: toTarget.clone().add(dir.multiplyScalar(focus ? FOCUS_DISTANCE : homeDistance)),
      toTarget,
    }
    controls.enabled = false
  }, [focus, homeDistance, camera, controls])

  useFrame((_, delta) => {
    const a = anim.current
    if (!a || !controls) return
    a.t = Math.min(1, a.t + delta / TRANSITION)
    const e = easeInOutCubic(a.t)
    camera.position.lerpVectors(a.fromPos, a.toPos, e)
    controls.target.lerpVectors(a.fromTarget, a.toTarget, e)
    controls.update()
    if (a.t === 1) {
      anim.current = null
      controls.enabled = true
      onSettled()
    }
  })

  return null
}

// Studio reflections: four emissive light panels baked into a PMREM environment map.
// Same result as drei's <Environment><Lightformer/></Environment>, without pulling
// its HDR/EXR/gainmap loaders into the bundle.
const LIGHT_PANELS = [
  { intensity: 2.2, position: [0, 5, -2], scale: [10, 3, 1], rotation: [Math.PI / 2, 0, 0] },
  { intensity: 1.4, position: [-5, 1.5, 1], scale: [3, 6, 1], rotation: [0, Math.PI / 2, 0] },
  { intensity: 1.2, position: [5, 1.5, -1], scale: [3, 6, 1], rotation: [0, -Math.PI / 2, 0] },
  { intensity: 0.6, color: '#ffb98a', position: [0, 1, 5], scale: [6, 2, 1] },
]

function Studio() {
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    const env = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(1, 1)
    const materials = LIGHT_PANELS.map((l) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(l.color ?? '#ffffff').multiplyScalar(l.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...l.position)
      mesh.scale.set(...l.scale)
      if (l.rotation) mesh.rotation.set(...l.rotation)
      env.add(mesh)
      return material
    })

    const pmrem = new THREE.PMREMGenerator(gl)
    const target = pmrem.fromScene(env, 0, 0.1, 100)
    scene.environment = target.texture

    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [gl, scene])

  return null
}

export function ScooterScene({ tint, pose, lang = 'en', hotspotsEnabled, onFocusChange }) {
  const [focus, setFocus] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [moving, setMoving] = useState(true)
  const focusRef = useRef(focus)
  useEffect(() => {
    focusRef.current = focus
  }, [focus])

  // Turning the hotspots off while zoomed in goes back to the home view.
  useEffect(() => {
    if (!hotspotsEnabled && focusRef.current) {
      setMoving(true)
      setFocus(null)
    }
  }, [hotspotsEnabled])

  // Tell clicks from drags on the whole page: drags hide the hotspots,
  // a plain click while zoomed in goes back to the home view.
  useEffect(() => {
    const root = document.getElementById('root')
    let start = null
    let dragged = false

    const down = (e) => {
      start = { x: e.clientX, y: e.clientY }
      dragged = false
    }
    const move = (e) => {
      if (!start || dragged) return
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD) {
        dragged = true
        setDragging(true)
      }
    }
    const up = (e) => {
      if (!start) return
      start = null
      if (dragged) {
        setDragging(false)
      } else if (focusRef.current && !e.target.closest('a, button, label, .credits')) {
        setMoving(true)
        setFocus(null)
      }
    }

    root.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      root.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const handleSelect = (id, point) => {
    setMoving(true)
    setFocus({ id, point })
  }

  useEffect(() => {
    onFocusChange?.(focus?.id ?? null)
  }, [focus, onFocusChange])

  return (
    <Canvas
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 6.4], fov: 29 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <OrbitControls
        makeDefault
        target={ORBIT_TARGET}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.49}
      />
      <CameraRig focus={focus?.point ?? null} onSettled={() => setMoving(false)} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Suspense fallback={null}>
        <FloatingScooter tint={tint} pose={pose} lang={lang} hotspotsEnabled={hotspotsEnabled} showHotspots={hotspotsEnabled && !focus && !dragging && !moving} onSelect={handleSelect} />
        <Studio />
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={8} blur={2.6} far={2.5} color="#0e1419" />
    </Canvas>
  )
}
