export default function Header({ count }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e2a45 100%)',
      borderBottom: '1px solid rgba(37,99,235,0.2)',
      padding: '18px 16px 14px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(37,99,235,0.25)',
              border: '1px solid rgba(37,99,235,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7 16 12 23 17z"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 15, fontWeight: 600, color: '#e8eaf0', letterSpacing: 0.2 }}>
              Nuel Tech Camera Database
            </h1>
          </div>
          <p style={{ fontSize: 11, color: '#4a6fa5', letterSpacing: 0.3, paddingLeft: 36 }}>
            Nuel Technologies and Engineering Limited
          </p>
        </div>
        <div style={{
          background: 'rgba(37,99,235,0.15)',
          border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 20,
          padding: '3px 10px',
          fontSize: 12,
          color: '#60a5fa',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}>
          {count} {count === 1 ? 'client' : 'clients'}
        </div>
      </div>
    </header>
  )
}
