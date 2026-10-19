// iOS-style switch.
export function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle" onPointerDown={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      <span className="toggle__label">{label}</span>
    </label>
  )
}
