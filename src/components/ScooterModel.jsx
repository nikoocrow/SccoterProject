import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/scooter.glb'
// Body materials that take the colorway tint (Scooter_03_03 is the tires).
const TINTABLE = ['Scooter_03_01', 'Scooter_03_02']

// Rig recreated from the source Unreal Blueprint (BP_Scooter_03): every part
// keeps its own pivot from the export, so each animation is a rotation added
// on top of the part's rest rotation. Axes are the parts' local (Z-up) axes:
// Y = lateral, Z = up / steering axis.
const PARTS = {
  wheelF: 'SM_Scooter_03_wheel_F',
  wheelB: 'SM_Scooter_03_wheel_B',
  steer: 'SM_Scooter_03_Wheel_Base',
  handlebar: 'SM_Scooter_03_Handlebar',
  latch: 'SM_Scooter_03_Holder_01',
  leg: 'SM_Scooter_03_Leg',
}
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1)

// Pose targets. `fold` and `leg` are 0..1 progress values.
const POSES = {
  static: { wheelSpeed: 0, steer: 0, fold: 0, leg: 0 },
  ride: { wheelSpeed: -9, steer: 0, fold: 0, leg: 0 },
  park: { wheelSpeed: 0, steer: 0.38, fold: 0, leg: 1 },
  fold: { wheelSpeed: 0, steer: 0, fold: 1, leg: 1 },
}
const FOLD_ANGLE = THREE.MathUtils.degToRad(104)
const LATCH_ANGLE = THREE.MathUtils.degToRad(-70)
const LEG_ANGLE = THREE.MathUtils.degToRad(100)

const tmpQ = new THREE.Quaternion()

// The GLB comes from an FBX export with arbitrary units and pivot,
// so we center it on the floor and scale it to a known height.
// `anchors` (optional): [{ id, part, position }] points in the normalized model space.
// For each one, `anchorsRef.current[id]` gets { node, local } so callers can follow
// that point as the part moves (see Hotspot in ScooterScene).
export function ScooterModel({ height = 2.6, tint = '#ffffff', pose = 'park', anchors, anchorsRef, ...props }) {
  const { scene } = useGLTF(MODEL_URL)

  const { model, scale, offset, tinted, rig } = useMemo(() => {
    const model = scene.clone(true)
    const tinted = new Map()
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      if (TINTABLE.includes(child.material.name)) {
        // Own copy per clone so tinting never leaks into the cached GLTF.
        if (!tinted.has(child.material.name)) {
          const mat = child.material.clone()
          tinted.set(mat.name, { mat, base: mat.color.clone() })
        }
        child.material = tinted.get(child.material.name).mat
      }
    })

    const rig = {}
    for (const [key, name] of Object.entries(PARTS)) {
      const node = model.getObjectByName(name)
      if (node) rig[key] = { node, rest: node.quaternion.clone() }
    }

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = height / size.y
    const offset = [-center.x * scale, -box.min.y * scale, -center.z * scale]
    return { model, scale, offset, tinted: [...tinted.values()], rig }
  }, [scene, height])

  // Convert anchor points to their part's local space. Done on the fresh clone,
  // while it's still at rest and has no parent, so only the model's own transforms count.
  const anchorPoints = useMemo(() => {
    const out = {}
    if (!anchors) return out
    model.updateMatrixWorld(true)
    for (const a of anchors) {
      const part = rig[a.part]
      if (!part) continue
      const p = new THREE.Vector3(...a.position).sub(new THREE.Vector3(...offset)).divideScalar(scale)
      out[a.id] = { node: part.node, local: part.node.worldToLocal(p) }
    }
    return out
  }, [model, rig, scale, offset, anchors])

  useLayoutEffect(() => {
    if (anchorsRef) anchorsRef.current = anchorPoints
  }, [anchorPoints, anchorsRef])

  const target = useMemo(() => new THREE.Color(tint), [tint])
  const tmp = useMemo(() => new THREE.Color(), [])
  const state = useRef({ wheelAngle: 0, wheelSpeed: 0, steer: 0, fold: 0, leg: 0 })

  useFrame(({ clock }, delta) => {
    // Ease the body color toward the selected colorway.
    const k = 1 - Math.exp(-delta * 5)
    for (const { mat, base } of tinted) {
      mat.color.lerp(tmp.copy(base).multiply(target), k)
    }

    // Ease every pose channel toward the selected pose.
    const s = state.current
    const p = POSES[pose] ?? POSES.park
    // Damp, then snap once close enough so a still pose really stops changing.
    const damp = (from, to, lambda, dt) => {
      const v = THREE.MathUtils.damp(from, to, lambda, dt)
      return Math.abs(v - to) < 1e-4 ? to : v
    }
    s.wheelSpeed = damp(s.wheelSpeed, p.wheelSpeed, 1.6, delta)
    // Small steering wobble while riding, like the Blueprint's free pose.
    const wobble = pose === 'ride' ? Math.sin(clock.elapsedTime * 1.3) * 0.06 : 0
    s.steer = damp(s.steer, p.steer + wobble, 3, delta)
    s.fold = damp(s.fold, p.fold, 2.6, delta)
    s.leg = damp(s.leg, p.leg, 3.2, delta)
    s.wheelAngle += s.wheelSpeed * delta

    const set = (part, axis, angle) => {
      if (!part) return
      part.node.quaternion.copy(part.rest).multiply(tmpQ.setFromAxisAngle(axis, angle))
    }
    set(rig.wheelF, Y, s.wheelAngle)
    set(rig.wheelB, Y, s.wheelAngle)
    set(rig.steer, Z, s.steer)
    // The latch opens during the first part of the fold and closes at the end of unfolding.
    set(rig.latch, Y, LATCH_ANGLE * Math.min(1, s.fold * 3))
    set(rig.handlebar, Y, FOLD_ANGLE * THREE.MathUtils.smoothstep(s.fold, 0.15, 1))
    set(rig.leg, Y, LEG_ANGLE * s.leg)
  })

  return (
    <group {...props}>
      <group position={offset} scale={scale}>
        <primitive object={model} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
