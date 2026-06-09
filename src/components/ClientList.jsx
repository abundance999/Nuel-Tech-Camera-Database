import ClientCard from './ClientCard'

function Skeleton() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg4)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '55%', background: 'var(--bg4)', borderRadius: 4, marginBottom: 7 }} />
          <div style={{ height: 11, width: '70%', background: 'var(--bg4)', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 12px' }}>
        {[60, 80, 70].map((w, i) => (
          <div key={i} style={{ height: 22, width: w, background: 'var(--bg4)', borderRadius: 20 }} />
        ))}
      </div>
    </div>
  )
}

export default function ClientList({ clients, loading, searchActive, onEdit, onDelete, isAdmin }) {
  if (loading) {
    return <>{[1,2,3,4].map(i => <Skeleton key={i} />)}</>
  }

  if (!clients.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
        <div style={{ marginBottom: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
        </div>
        <p style={{ fontSize: 14 }}>
          {searchActive ? 'No clients match your search.' : 'No clients yet. Tap + to add the first record.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {clients.map(c => (
        <ClientCard key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />
      ))}
      <div style={{ height: 10 }} />
    </>
  )
}
