import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const SUBSCRIPTION_PLANS = ['1 month', '6 months', '1 year']

export default function SubscriptionModal({ client, onClose, onSave, onShowToast }) {
  const [form, setForm] = useState({
    subscription_plan: '',
    subscription_date: new Date().toISOString().split('T')[0],
    expiring_date: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const simEntries = Array.isArray(client.sims) ? client.sims.filter(s => s.number || s.network) : []
  const phoneNumbers = simEntries.map(s => s.number).filter(Boolean)
  const networkNames = [...new Set(simEntries.map(s => s.network).filter(Boolean))]
  const [amounts, setAmounts] = useState(() => (
    phoneNumbers.reduce((acc, number) => ({ ...acc, [number]: '' }), {})
  ))
  const [dataSizes, setDataSizes] = useState(() => (
    phoneNumbers.reduce((acc, number) => ({ ...acc, [number]: '' }), {})
  ))

  const networkByNumber = simEntries.reduce((acc, sim) => {
    if (sim.number) acc[sim.number] = sim.network || ''
    return acc
  }, {})

  useEffect(() => {
    setAmounts(phoneNumbers.reduce((acc, number) => ({ ...acc, [number]: amounts[number] || '' }), {}))
    setDataSizes(phoneNumbers.reduce((acc, number) => ({ ...acc, [number]: dataSizes[number] || '' }), {}))
  }, [phoneNumbers.join(',')])

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')

    if (!form.subscription_plan.trim()) {
      setError('Subscription Plan is required.')
      return
    }
    if (!phoneNumbers.length) {
      setError('No phone numbers available for this client.')
      return
    }
    const missingAmount = phoneNumbers.some(number => {
      const value = amounts[number]
      return !value || parseFloat(value) <= 0
    })
    if (missingAmount) {
      setError('Amount subscribed is required for every phone number.')
      return
    }
    const missingDataSize = phoneNumbers.some(number => {
      const value = dataSizes[number]
      return !value || parseFloat(value) <= 0
    })
    if (missingDataSize) {
      setError('Data size in GB is required for every phone number.')
      return
    }
    if (!form.subscription_date) {
      setError('Subscription Date is required.')
      return
    }
    if (!form.expiring_date) {
      setError('Expiring Date is required.')
      return
    }

    const subDate = new Date(form.subscription_date)
    const expDate = new Date(form.expiring_date)
    if (expDate <= subDate) {
      setError('Expiring Date must be after Subscription Date.')
      return
    }

    setSaving(true)
    const subscriptions = phoneNumbers.map(number => ({
      client_id: client.id,
      phone_number: number,
      network: networkByNumber[number] || '',
      system: client.system || '',
      subscription_plan: form.subscription_plan.trim(),
      subscription_date: form.subscription_date,
      expiring_date: form.expiring_date,
      amount_subscribed: parseFloat(amounts[number]),
      data_size_gb: parseFloat(dataSizes[number]),
    }))
    const { error: err } = await supabase.from('subscriptions').insert(subscriptions)
    setSaving(false)

    if (err) {
      setError('Failed to save subscription: ' + (err.message || 'unknown error'))
      return
    }

    onShowToast('Subscription added')
    onSave?.()
    onClose()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div style={{
        background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border2)', borderBottom: 'none',
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
            <h2 style={{ fontSize: 15, fontWeight: 500 }}>Add Subscription</h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              Create a subscription for {client.name || 'this client'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {/* Read-only fields */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontWeight: 500 }}>Client Info (Read-only)</p>
            <div style={{ display: 'grid', gap: 8, lineHeight: 1.6, color: 'var(--text)' }}>
              <div>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Client Name</span>
                <p style={{ margin: 0, fontSize: 14 }}>{client.name || '—'}</p>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Phone Numbers</span>
                <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-line' }}>
                  {phoneNumbers.length ? phoneNumbers.join('\n') : '—'}
                </p>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Networks</span>
                <p style={{ margin: 0, fontSize: 14 }}>{networkNames.length ? networkNames.join(', ') : '—'}</p>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>System</span>
                <p style={{ margin: 0, fontSize: 14 }}>{client.system || '—'}</p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontWeight: 500 }}>Subscription Details <span style={{ color: '#f87171' }}>*</span></p>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Subscription Plan</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUBSCRIPTION_PLANS.map(plan => {
                    const active = form.subscription_plan === plan
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, subscription_plan: plan }))}
                        style={{
                          flex: 1,
                          minWidth: 90,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: active ? '1px solid var(--accent)' : '1px solid var(--border2)',
                          background: active ? 'var(--accent-soft)' : 'var(--bg4)',
                          color: active ? 'var(--accent)' : 'var(--text)',
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          cursor: 'pointer',
                          fontFamily: 'var(--font)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {plan}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Subscription Date</label>
                  <input
                    type="date"
                    value={form.subscription_date}
                    onChange={set('subscription_date')}
                    style={{
                      width: '100%',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border2)',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 14,
                      color: 'var(--text)',
                      outline: 'none',
                      fontFamily: 'var(--font)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border2)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Expiring Date</label>
                  <input
                    type="date"
                    value={form.expiring_date}
                    onChange={set('expiring_date')}
                    style={{
                      width: '100%',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border2)',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 14,
                      color: 'var(--text)',
                      outline: 'none',
                      fontFamily: 'var(--font)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border2)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {phoneNumbers.length ? phoneNumbers.map(number => (
                  <div key={number} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border2)' }}>
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Phone Number</span>
                      <p style={{ margin: 0, fontSize: 14 }}>{number}</p>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Amount Subscribed</label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={amounts[number] || ''}
                          onChange={e => setAmounts(prev => ({ ...prev, [number]: e.target.value }))}
                          min="0"
                          style={{
                            width: '100%',
                            background: 'var(--bg3)',
                            border: '1px solid var(--border2)',
                            borderRadius: 8,
                            padding: '9px 12px',
                            fontSize: 14,
                            color: 'var(--text)',
                            outline: 'none',
                            fontFamily: 'var(--font)',
                          }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)' }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border2)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Data Size (GB)</label>
                        <input
                          type="number"
                          placeholder="e.g. 32"
                          value={dataSizes[number] || ''}
                          onChange={e => setDataSizes(prev => ({ ...prev, [number]: e.target.value }))}
                          min="0"
                          style={{
                            width: '100%',
                            background: 'var(--bg3)',
                            border: '1px solid var(--border2)',
                            borderRadius: 8,
                            padding: '9px 12px',
                            fontSize: 14,
                            color: 'var(--text)',
                            outline: 'none',
                            fontFamily: 'var(--font)',
                          }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)' }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border2)' }}
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text3)', fontSize: 13 }}>No phone numbers available</div>
                )}
              </div>
            </div>
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
            }}
          >
            {saving ? 'Saving…' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </div>
  )
}
