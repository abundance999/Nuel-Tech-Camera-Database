import { useState } from 'react'

export default function AdminManager({ admins, loading, onAdd, onRemove }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    const normalized = email.trim().toLowerCase()
    if (!normalized || !normalized.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSaving(true)
    const success = await onAdd(normalized)
    setSaving(false)
    if (success) setEmail('')
  }

  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Admin Management</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Add or remove admin access via email.</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)' }}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)', color: '#fff', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(38,168,61,0.3)' }}
          >
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
        {error && <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</div>}
      </div>

      <div style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Current admins</div>
        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading admin list…</div>
        ) : admins.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>No admin emails configured yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {admins.map((admin) => (
              <div key={admin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', background: 'var(--bg4)', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{admin}</span>
                <button
                  onClick={() => onRemove(admin)}
                  style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 8, padding: '6px 10px', color: 'var(--text2)', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
