function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 600, color: accent || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</p>
    </div>
  )
}

function GroupList({ title, data, color, softColor, borderColor }) {
  if (!data.length) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontWeight: 500 }}>{title}</p>
      {data.map(([key, count]) => (
        <div key={key} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13 }}>{key}</span>
          <span style={{
            background: softColor, color, border: `1px solid ${borderColor}`,
            borderRadius: 20, fontSize: 11, padding: '2px 10px', fontFamily: 'var(--mono)',
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
    list.filter(Boolean).forEach(name => {
      installerMap[name] = (installerMap[name] || 0) + 1
    })
  })
  const installers = Object.entries(installerMap).sort((a, b) => b[1] - a[1])

  const networkMap = {}
  clients.forEach(c => {
    if (Array.isArray(c.sims)) {
      c.sims.forEach(s => {
        if (s.network) networkMap[s.network] = (networkMap[s.network] || 0) + 1
      })
    }
  })
  const networks = Object.entries(networkMap).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Clients" value={clients.length} accent="#60a5fa" />
        <StatCard label="Cams Installed" value={totalCams} accent="#34d399" />
      </div>

      <GroupList
        title="System Types"
        data={systems}
        color="#34d399" softColor="var(--green-soft)" borderColor="rgba(16,185,129,0.2)"
      />
      <GroupList
        title="Installers"
        data={installers}
        color="#f59e0b" softColor="var(--amber-soft)" borderColor="rgba(245,158,11,0.2)"
      />
      <GroupList
        title="SIM Networks"
        data={networks}
        color="#60a5fa" softColor="var(--accent-soft)" borderColor="rgba(37,99,235,0.2)"
      />

      <div style={{ height: 70 }} />
    </div>
  )
}
