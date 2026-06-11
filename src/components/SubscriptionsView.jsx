import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function SubscriptionsView({ isAdmin }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [clients, setClients] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedClients, setExpandedClients] = useState({})

  useEffect(() => {
    fetchSubscriptionsAndClients()
  }, [])

  const fetchSubscriptionsAndClients = async () => {
    setLoading(true)
    
    // Fetch subscriptions
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select('*, clients(name, contact, sims)')
      .order('subscription_date', { ascending: false })
    
    if (!subsError) {
      setSubscriptions(subsData || [])
      
      // Build clients map for quick lookup with phone numbers
      const clientsMap = {}
      subsData?.forEach(sub => {
        if (!clientsMap[sub.client_id]) {
          const client = sub.clients
          if (client) {
            const phones = new Set()
            if (client.contact) phones.add(client.contact)
            if (client.sims && Array.isArray(client.sims)) {
              client.sims.forEach(sim => {
                if (sim.number) phones.add(sim.number)
              })
            }
            clientsMap[sub.client_id] = {
              name: client.name,
              phones: Array.from(phones)
            }
          }
        }
      })
      setClients(clientsMap)
    }
    setLoading(false)
  }

  const toggleClientExpanded = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }))
  }

  const filtered = subscriptions.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (s.clients?.name || '').toLowerCase().includes(q) ||
      (s.phone_number || '').toLowerCase().includes(q) ||
      (s.subscription_plan || '').toLowerCase().includes(q) ||
      (s.network || '').toLowerCase().includes(q)
    )
  })

  const groupedByClient = filtered.reduce((acc, sub) => {
    const clientId = sub.client_id
    if (!acc[clientId]) {
      acc[clientId] = {
        clientName: sub.clients?.name || 'Unknown Client',
        subscriptions: []
      }
    }
    acc[clientId].subscriptions.push(sub)
    return acc
  }, {})

  const sortedClients = Object.entries(groupedByClient)
    .map(([clientId, data]) => ({
      clientId,
      clientName: data.clientName,
      subscriptions: data.subscriptions,
      phones: clients[clientId]?.phones || [],
      mostRecentDate: new Date(Math.max(...data.subscriptions.map(s => new Date(s.subscription_date).getTime())))
    }))
    .sort((a, b) => b.mostRecentDate - a.mostRecentDate)

  if (loading) {
    return <div style={{ padding: '20px', color: 'var(--text3)' }}>Loading subscriptions…</div>
  }

  if (!subscriptions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
        <p style={{ fontSize: 14 }}>No subscriptions yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '12px 14px', position: 'sticky', top: 113, zIndex: 99 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', flexShrink: 0 }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by phone, plan, network…"
            style={{
              width: '100%',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: 9,
              padding: '9px 36px 9px 34px',
              fontSize: 14,
              color: 'var(--text)',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(38,168,61,0.5)'
              e.target.style.boxShadow = '0 0 0 3px rgba(38,168,61,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border2)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {sortedClients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <p style={{ fontSize: 14 }}>No subscriptions found.</p>
        </div>
      ) : (
        sortedClients.map(clientGroup => (
          <div key={clientGroup.clientId} style={{ marginBottom: 12 }}>
            {/* Client Header - Clickable Dropdown */}
            <div
              onClick={() => toggleClientExpanded(clientGroup.clientId)}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                margin: '12px 14px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  {clientGroup.clientName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {clientGroup.phones.length > 0 ? (
                    clientGroup.phones.map((phone, idx) => (
                      <span key={idx}>{phone}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text3)' }}>No phone numbers</span>
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 12,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
                  {clientGroup.subscriptions.length}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    color: 'var(--text2)',
                    transition: 'transform 0.2s',
                    transform: expandedClients[clientGroup.clientId] ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Subscriptions Dropdown */}
            {expandedClients[clientGroup.clientId] && (
              <div style={{ marginLeft: '14px', marginRight: '14px', marginTop: 8, display: 'grid', gap: 8 }}>
                {clientGroup.subscriptions.map(sub => (
                  <div key={sub.id} style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{sub.subscription_plan}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                        {sub.phone_number} · {sub.network || 'No network'}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                      <div>
                        <span style={{ color: 'var(--text3)', fontSize: 10 }}>From</span>
                        <div style={{ color: 'var(--text)', marginTop: 2, fontFamily: 'var(--mono)', fontSize: 12 }}>
                          {new Date(sub.subscription_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text3)', fontSize: 10 }}>To</span>
                        <div style={{ color: 'var(--text)', marginTop: 2, fontFamily: 'var(--mono)', fontSize: 12 }}>
                          {new Date(sub.expiring_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text3)', fontSize: 10 }}>Amount</span>
                        <div style={{ color: 'var(--text)', marginTop: 2, fontFamily: 'var(--mono)', fontSize: 12 }}>
                          {parseFloat(sub.amount_subscribed).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text3)', fontSize: 10 }}>Data</span>
                        <div style={{ color: 'var(--text)', marginTop: 2, fontSize: 12 }}>
                          {sub.data_size_gb ? `${parseFloat(sub.data_size_gb).toLocaleString()} GB` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      <div style={{ height: 20 }} />
    </div>
  )
}
