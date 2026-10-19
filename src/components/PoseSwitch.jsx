// Segmented control for the scooter poses (ride / park / fold).
export function PoseSwitch({ label = 'Pose', options, value, onChange }) {
  const index = Math.max(0, options.findIndex((o) => o.id === value))
  return (
    <div
      className="pose-switch"
      role="radiogroup"
      aria-label={label}
      style={{ '--count': options.length, '--index': index }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="pose-switch__pill" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={o.id === value}
          className={o.id === value ? 'is-active' : ''}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
