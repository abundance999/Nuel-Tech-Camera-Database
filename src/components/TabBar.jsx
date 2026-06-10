export default function TabBar({ active, onChange }) {
  const tabs = [
    {
      id: 'list', label: 'All Clients',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    },
    {
      id: 'stats', label: 'Summary',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    },
  ]

  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 113,
      zIndex: 98,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 0',
            background: 'none', border: 'none',
            borderBottom: active === t.id ? '2px solid var(--green)' : '2px solid transparent',
            color: active === t.id ? '#4ade6e' : 'var(--text3)',
            fontSize: 13,
            fontWeight: active === t.id ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}
