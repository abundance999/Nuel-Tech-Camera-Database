export default function Header({ count }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--navy-deeper) 0%, var(--navy) 60%, #1e3a6e 100%)',
      borderBottom: '1px solid rgba(38,168,61,0.25)',
      padding: '14px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            padding: 3,
          }}>
            <img
              src="/logo.svg"
              alt="Nuel Tech Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: 0.3,
              lineHeight: 1.2,
            }}>
              Camera Database
            </h1>
            <p style={{
              fontSize: 11,
              color: 'rgba(38,168,61,0.9)',
              letterSpacing: 0.2,
              marginTop: 1,
              fontWeight: 500,
            }}>
              Nuel Technologies & Engineering Ltd
            </p>
          </div>
        </div>

        {/* Count badge */}
        <div style={{
          background: 'rgba(38,168,61,0.15)',
          border: '1px solid rgba(38,168,61,0.35)',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 12,
          color: '#4ade6e',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          letterSpacing: 0.2,
        }}>
          {count} {count === 1 ? 'client' : 'clients'}
        </div>
      </div>
    </header>
  )
}
