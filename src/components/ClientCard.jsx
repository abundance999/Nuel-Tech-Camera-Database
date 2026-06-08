import { useState } from 'react'

function initials(name) {
  return (name || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

const AVATAR_COLORS = [
  ['#1e3a5f','#60a5fa'],['#1a3a2e','#34d399'],['#3b2a1a','#f59e0b'],
  ['#2d1b3d','#a78bfa'],['#1f2937','#94a3b8'],['#2a1a2e','#f472b6'],
]
function avatarColor(name) {
  const i = (name || 'A').charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}

function Row({ label, value, mono, icon }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 12,
    }}>
      <span style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {icon}{label}
      </span>
      <span style={{
        fontSize: 13, textAlign: 'right', wordBreak: 'break-all',
        fontFamily: mono ? 'var(--mono)' : 'var(--font)',
        fontSize: mono ? 12 : 13,
        color: value && value !== '—' ? 'var(--text)' : 'var(--text3)',
      }}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function ClientCard({ client, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [bg, fg] = avatarColor(client.name)

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 10,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Card Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg, color: fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, flexShrink: 0, fontFamily: 'var(--mono)',
        }}>
          {initials(client.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {client.name || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {client.location || '—'}
            </span>
            <span style={{ color: 'var(--text3)', flexShrink: 0 }}>· {fmtDate(client.date)}</span>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 11px', flexWrap: 'wrap' }}>
        {client.cameras && (
          <span style={{ background: 'var(--accent-soft)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 20, fontSize: 11, padding: '2px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7 16 12 23 17z"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/>
            </svg>
            {client.cameras} cam{client.cameras > 1 ? 's' : ''}
          </span>
        )}
        {client.system && (
          <span style={{ background: 'var(--green-soft)', color: '#34d399', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, fontSize: 11, padding: '2px 9px' }}>
            {client.system}
          </span>
        )}
        {(() => {
          const instList = (Array.isArray(client.installers) ? client.installers : (client.installer ? [client.installer] : [])).filter(Boolean)
          if (!instList.length) return null
          const extra = instList.length - 1
          return (
            <span style={{ background: 'var(--amber-soft)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, fontSize: 11, padding: '2px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              {instList[0]}{extra > 0 && <span style={{ opacity: 0.75 }}> (+{extra})</span>}
            </span>
          )
        })()}
      </div>

      {/* Expanded Detail */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', background: 'var(--bg3)' }}>
          <Row label="Contact" value={client.contact} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.28 19.79 19.79 0 0 1 1.65 3.7 2 2 0 0 1 3.62 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.06a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16.5z"/></svg>} />
          {/* Installers */}
          {(() => {
            const instList = Array.isArray(client.installers) ? client.installers.filter(Boolean) : (client.installer ? [client.installer] : [])
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  Installer{instList.length > 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 13, textAlign: 'right', color: instList.length ? 'var(--text)' : 'var(--text3)' }}>
                  {instList.length ? instList.join(', ') : '—'}
                </span>
              </div>
            )
          })()}
          <Row label="Username" value={client.username} mono icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <Row label="Password" value={client.password} mono icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} />
          {/* SIM Cards */}
          {(() => {
            const simList = Array.isArray(client.sims) && client.sims.length > 0
              ? client.sims.filter(s => s.number || s.network)
              : []
            const netColors = {
              MTN:    { bg: 'rgba(255,204,0,0.12)',  border: 'rgba(255,204,0,0.3)',  color: '#f5cc00' },
              Airtel: { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' },
              Glo:    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
            }
            return (
              <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: simList.length ? 8 : 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text2)', flexShrink: 0 }}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>SIM Cards</span>
                  {simList.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginLeft: 2 }}>({simList.length})</span>
                  )}
                </div>
                {simList.length === 0 ? (
                  <span style={{ fontSize: 13, color: 'var(--text3)', paddingLeft: 18 }}>—</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {simList.map((s, i) => {
                      const nc = netColors[s.network]
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg4)', borderRadius: 8, padding: '6px 10px' }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginRight: 8, flexShrink: 0 }}>SIM {i + 1}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, flex: 1, color: s.number ? 'var(--text)' : 'var(--text3)' }}>{s.number || '—'}</span>
                          {s.network && nc && (
                            <span style={{ background: nc.bg, color: nc.color, border: `1px solid ${nc.border}`, borderRadius: 12, fontSize: 11, padding: '1px 8px', marginLeft: 6, flexShrink: 0 }}>
                              {s.network}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => onEdit(client)}
              style={{
                flex: 1, padding: '8px', background: 'var(--bg4)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '8px 14px', background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, color: '#f87171', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { onDelete(client.id); setConfirmDelete(false) }}
                  style={{ padding: '8px 12px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ padding: '8px 12px', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
