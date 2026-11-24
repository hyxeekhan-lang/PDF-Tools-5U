/** Marching dashed outline for a drop zone; pulses while a file is dragged over it. Parent must be `relative`. */
export function DropFrame({ dragging }: { dragging: boolean }) {
  return (
    <>
      {dragging && (
        <span
          aria-hidden
          className="drag-glow pointer-events-none absolute -inset-1 rounded-[calc(var(--radius-card)+4px)] ring-4 ring-accent/25"
        />
      )}
      <svg aria-hidden className={`dash-border pointer-events-none absolute inset-0 size-full overflow-visible ${dragging ? 'is-dragging' : ''}`}>
        <rect
          x="1"
          y="1"
          rx="19"
          style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity={dragging ? 1 : 0.5}
          strokeWidth="2"
        />
      </svg>
    </>
  )
}
