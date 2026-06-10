import { useState, useEffect } from 'react'

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14, transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg3)',
  border: '1px solid var(--border2)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font)',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
}

function Input({ type = 'text', placeholder, value, onChange, min, disabled }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      disabled={disabled}
      style={{
        ...inputStyle,
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(38,168,61,0.1)' }}
      onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

const NETWORKS = ['MTN', 'Airtel', 'Glo']
const NETWORK_COLORS = {
  MTN:    { bg: 'rgba(255,204,0,0.12)',  border: 'rgba(255,204,0,0.3)',  color: '#f5cc00' },
  Airtel: { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' },
  Glo:    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
}

function AddMoreBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '9px', background: 'none',
        border: '1px dashed var(--border2)', borderRadius: 10,
        color: '#60a5fa', fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'var(--font)', marginTop: 2,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      {label}
    </button>
  )
}

function RemoveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '2px 8px', color: '#f87171', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease' }}
    >
      Remove
    </button>
  )
}

function InstallerRow({ value, index, onChange, onRemove, showRemove }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '11px 12px', marginBottom: 8,
      transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Installer {index + 1}</span>
        {showRemove && <RemoveBtn onClick={() => onRemove(index)} />}
      </div>
      <input
        type="text"
        placeholder="Technician name"
        value={value}
        onChange={e => onChange(index, e.target.value)}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

function SimRow({ sim, index, onChange, onRemove, showRemove }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '11px 12px', marginBottom: 8,
      transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>SIM {index + 1}</span>
        {showRemove && <RemoveBtn onClick={() => onRemove(index)} />}
      </div>
      <input
        type="text"
        placeholder="SIM card number"
        value={sim.number}
        onChange={e => onChange(index, 'number', e.target.value)}
        style={{ ...inputStyle, marginBottom: 9 }}
        onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
      <div style={{ display: 'flex', gap: 7 }}>
        {NETWORKS.map(net => {
          const c = NETWORK_COLORS[net]
          const active = sim.network === net
          return (
            <button
              key={net}
              onClick={() => onChange(index, 'network', active ? '' : net)}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 8,
                border: `1px solid ${active ? c.border : 'var(--border2)'}`,
                background: active ? c.bg : 'var(--bg4)',
                color: active ? c.color : 'var(--text3)',
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s',
              }}
            >
              {net}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const EMPTY_SIM = () => ({ number: '', network: '' })
const EMPTY = { date: '', name: '', contact: '', location: '', cameras: '', system: '', subscription: '', username: '', password: '' }

export default function ClientModal({ client, onClose, onSave, isAdmin }) {
  const [form, setForm] = useState(() => client ? {
    date: client.date || '',
    name: client.name || '',
    contact: client.contact || '',
    location: client.location || '',
    cameras: client.cameras || '',
    system: client.system || '',
    subscription: client.subscription || '',
    username: client.username || '',
    password: client.password || '',
  } : { ...EMPTY, date: new Date().toISOString().split('T')[0] })
  const [installers, setInstallers] = useState(() => {
    if (client) {
      return Array.isArray(client.installers) && client.installers.length > 0
        ? client.installers
        : (client.installer ? [client.installer] : [''])
    }
    return ['']
  })
  const [sims, setSims] = useState(() => client ? (
    Array.isArray(client.sims) && client.sims.length > 0 ? client.sims : [EMPTY_SIM()]
  ) : [EMPTY_SIM()])
  const [saving, setSaving] = useState(false)
  const publicAdd = !isAdmin && !client
  const canEditName = isAdmin
  const canEditContact = isAdmin
  const canEditCredentials = isAdmin || !client
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    return () => setMounted(false)
  }, [])

  const closeModal = () => {
    if (exiting) return
    setExiting(true)
    window.setTimeout(() => {
      onClose()
    }, 250)
  }


  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const updateInstaller = (i, val) => setInstallers(arr => arr.map((v, idx) => idx === i ? val : v))
  const addInstaller = () => setInstallers(arr => [...arr, ''])
  const removeInstaller = i => setInstallers(arr => arr.filter((_, idx) => idx !== i))

  const updateSim = (i, key, val) => setSims(s => s.map((row, idx) => idx === i ? { ...row, [key]: val } : row))
  const addSim = () => setSims(s => [...s, EMPTY_SIM()])
  const removeSim = i => setSims(s => s.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.system.trim()) { setError('Type of system is required.'); return }
    if (!form.cameras) { setError('Number of cameras is required.'); return }
    if (!form.location.trim()) { setError('Site location is required.'); return }
    const cleanInstallers = installers.filter(v => v.trim())
    if (!cleanInstallers.length) { setError('At least one installer is required.'); return }
    if (!form.username.trim()) { setError('Username is required.'); return }
    if (!form.password.trim()) { setError('Password is required.'); return }
    const cleanSims = sims.filter(s => s.number.trim() || s.network)
    if (!cleanSims.length) { setError('At least one SIM card entry is required.'); return }
    setError('')
    setSaving(true)
    const success = await onSave({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      cameras: form.cameras ? parseInt(form.cameras) : null,
      subscription: form.subscription ? parseFloat(form.subscription) : null,
      installers: cleanInstallers,
      sims: cleanSims,
    })
    setSaving(false)
    if (success) closeModal()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && closeModal()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div style={{
        background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border2)', borderBottom: 'none',
        opacity: mounted && !exiting ? 1 : 0,
        transform: mounted && !exiting ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: exiting ? 'none' : 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bg4)' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '8px 16px 12px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 500 }}>{client ? 'Edit client record' : 'Add new client'}</h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              {client ? 'Update the fields below' : 'Fill in the installation details'}
            </p>
          </div>
          <button onClick={closeModal} style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, transition: 'opacity 0.25s ease, transform 0.25s ease' }}>

          {/* Optional fields */}
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontWeight: 500 }}>General Info</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 0 }}>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={set('date')} />
            </Field>
            {(!publicAdd || isAdmin) && (
              <Field label="Client Name">
                <Input
                  placeholder="Name or business"
                  value={form.name}
                  onChange={set('name')}
                  disabled={!canEditName}
                />
              </Field>
            )}
          </div>

          {(!publicAdd || isAdmin) && (
            <Field label="Client Contact">
              <Input
                placeholder="Phone number or email"
                value={form.contact}
                onChange={set('contact')}
                disabled={!canEditContact}
              />
            </Field>
          )}

          {/* Required fields */}
          <div style={{ marginBottom: 6, marginTop: 4 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontWeight: 500 }}>Installation Details <span style={{ color: '#f87171' }}>*</span></p>
          </div>

          <Field label="Site Location" required>
            <Input placeholder="Address or area" value={form.location} onChange={set('location')} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Type of System" required>
              <Input placeholder="DVR, NVR, IP…" value={form.system} onChange={set('system')} />
            </Field>
            <Field label="No. of Cameras" required>
              <Input type="number" placeholder="e.g. 4" value={form.cameras} onChange={set('cameras')} min="1" />
            </Field>
          </div>

          {isAdmin && (
            <Field label="Subscription amount">
              <Input type="number" placeholder="e.g. 25000" value={form.subscription} onChange={set('subscription')} min="0" />
            </Field>
          )}

          {/* Installers */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)' }}>
                Installers <span style={{ color: '#f87171' }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                {installers.length} person{installers.length !== 1 ? 's' : ''}
              </span>
            </div>
            {installers.map((val, i) => (
              <InstallerRow
                key={i} value={val} index={i}
                onChange={updateInstaller} onRemove={removeInstaller}
                showRemove={installers.length > 1}
              />
            ))}
            <AddMoreBtn onClick={addInstaller} label="Add another installer" />
          </div>

          {/* Credentials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Field label="Username" required>
              <Input
                placeholder="DVR username"
                value={form.username}
                onChange={set('username')}
                disabled={!canEditCredentials}
              />
            </Field>
            <Field label="Password" required>
              <Input
                placeholder="DVR password"
                value={form.password}
                onChange={set('password')}
                disabled={!canEditCredentials}
              />
            </Field>
          </div>

          {/* SIM Cards */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)' }}>
                SIM Cards <span style={{ color: '#f87171' }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                {sims.length} card{sims.length !== 1 ? 's' : ''}
              </span>
            </div>
            {sims.map((sim, i) => (
              <SimRow key={i} sim={sim} index={i} onChange={updateSim} onRemove={removeSim} showRemove={sims.length > 1} />
            ))}
            <AddMoreBtn onClick={addSim} label="Add another SIM card" />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f87171', marginTop: 12,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleSubmit} disabled={saving}
            style={{
              width: '100%', padding: '13px',
              background: saving ? 'var(--bg4)' : 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)',
              color: saving ? 'var(--text3)' : '#fff',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
              boxShadow: saving ? 'none' : '0 3px 14px rgba(38,168,61,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : (client ? 'Update Record' : 'Save Client Record')}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
