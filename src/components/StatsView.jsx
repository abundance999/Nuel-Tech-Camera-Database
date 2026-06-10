function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
      boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</p>
    </div>
  )
}

function GroupList({ title, data, color, softColor, borderColor }) {
  if (!data.length) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontWeight: 600 }}>{title}</p>
      {data.map(([key, count]) => (
        <div key={key} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{key}</span>
          <span style={{
            background: softColor, color, border: `1px solid ${borderColor}`,
            borderRadius: 20, fontSize: 12, padding: '2px 12px', fontFamily: 'var(--mono)', fontWeight: 600,
          }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function StatsView({ clients, loading }) {
  if (loading) return null
  if (!clients.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
        <p style={{ fontSize: 14 }}>No data to summarise yet.</p>
      </div>
    )
  }

  const totalCams = clients.reduce((s, c) => s + (parseInt(c.cameras) || 0), 0)

  const tally = (key) => {
    const map = {}
    clients.forEach(c => { if (c[key]) map[c[key]] = (map[c[key]] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const systems = tally('system')

  const installerMap = {}
  clients.forEach(c => {
    const list = Array.isArray(c.installers) ? c.installers : (c.installer ? [c.installer] : [])
    list.filter(Boolean).forEach(name => { installerMap[name] = (installerMap[name] || 0) + 1 })
  })
  const installers = Object.entries(installerMap).sort((a, b) => b[1] - a[1])

  const networkMap = {}
  clients.forEach(c => {
    if (Array.isArray(c.sims)) {
      c.sims.forEach(s => { if (s.network) networkMap[s.network] = (networkMap[s.network] || 0) + 1 })
    }
  })
  const networks = Object.entries(networkMap).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Clients" value={clients.length} color="#4ade6e" />
        <StatCard label="Cams Installed" value={totalCams} color="#7aa4f0" />
      </div>

      <GroupList title="System Types" data={systems}
        color="#4ade6e" softColor="rgba(38,168,61,0.12)" borderColor="rgba(38,168,61,0.3)" />
      <GroupList title="Installers" data={installers}
        color="#fbbf24" softColor="rgba(245,158,11,0.12)" borderColor="rgba(245,158,11,0.2)" />
      <GroupList title="SIM Networks" data={networks}
        color="#7aa4f0" softColor="rgba(34,47,89,0.5)" borderColor="rgba(34,47,89,0.7)" />

      <div style={{ height: 70 }} />
    </div>
  )
}
