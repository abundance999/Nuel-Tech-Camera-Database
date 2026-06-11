import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function SubscriptionsHistory({ clientId, refreshToken }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [clientId, refreshToken])

  const fetchSubscriptions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .order('subscription_date', { ascending: false })
    if (data) {
      setSubscriptions(data)
    }
    setLoading(false)
  }

  if (!subscriptions.length && !loading && open) {
    return (
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <button
          onClick={() => setOpen(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            fontSize: 12,
            padding: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
          No subscriptions
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            fontSize: 12,
            padding: 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h2m6 0h2m6 0h2M3 6h18M3 18h18"/>
            </svg>
            Subscriptions ({subscriptions.length})
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0' }}>Loading…</div>
          ) : subscriptions.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0' }}>No subscriptions yet</div>
          ) : (
            subscriptions.map(sub => (
              <div key={sub.id} style={{
                background: 'var(--bg4)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 11,
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {sub.subscription_plan}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10, color: 'var(--text2)' }}>
                  <div>
                    <span style={{ color: 'var(--text3)' }}>From:</span> {new Date(sub.subscription_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text3)' }}>To:</span> {new Date(sub.expiring_date).toLocaleDateString()}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text3)' }}>Amount:</span> {parseFloat(sub.amount_subscribed).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
