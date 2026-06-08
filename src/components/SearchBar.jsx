export default function SearchBar({ value, onChange }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 68,
      zIndex: 99,
    }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search name, location, installer, SIM…"
          style={{
            width: '100%',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: 8,
            padding: '9px 36px 9px 34px',
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
              display: 'flex', alignItems: 'center', padding: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
