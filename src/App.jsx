import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TabBar from './components/TabBar'
import ClientList from './components/ClientList'
import StatsView from './components/StatsView'
import SubscriptionsView from './components/SubscriptionsView'
import ClientModal from './components/ClientModal'
import SubscriptionModal from './components/SubscriptionModal'
import AdminManager from './components/AdminManager'
import FAB from './components/FAB'
import Toast from './components/Toast'
import './index.css'

const ADMIN_EMAILS = import.meta.env.VITE_SUPABASE_ADMIN_EMAILS
  ? import.meta.env.VITE_SUPABASE_ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
  : []

function getModeFromHash(hash) {
  const cleaned = (hash || '').replace('#', '').replace('/', '')
  return cleaned === 'admin' ? 'admin' : 'public'
}

export default function App() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('list')
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hashMode = getModeFromHash(window.location.hash)
      if (hashMode === 'admin') return 'admin'
      return localStorage.getItem('appMode') || 'public'
    }
    return 'public'
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [subscriptionRefresh, setSubscriptionRefresh] = useState(0)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authMode, setAuthMode] = useState('signin')
  const [loginError, setLoginError] = useState('')
  const [adminEmails, setAdminEmails] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminConfigured, setAdminConfigured] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  const isAdmin = Boolean(
    user && (
      ADMIN_EMAILS.includes(user.email?.toLowerCase()) ||
      user.user_metadata?.role === 'admin' ||
      adminEmails.includes(user.email?.toLowerCase())
    )
  )

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setClients(data || [])
    else showToast('Failed to load clients', 'error')
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients()
  }, [fetchClients])

  const fetchAdminEmails = useCallback(async () => {
    setAdminLoading(true)
    const { data, error } = await supabase
      .from('admin_users')
      .select('email')
      .order('created_at', { ascending: false })
    if (!error && data) {
      const normalized = data.map(item => item.email.toLowerCase())
      setAdminEmails(normalized)
      setAdminConfigured(normalized.length > 0)
    } else {
      setAdminEmails([])
      setAdminConfigured(false)
      if (error && error.code !== '42P01') {
        showToast('Unable to load admin list', 'error')
      }
    }
    setAdminLoading(false)
  }, [])

  useEffect(() => {
    const loadAdmins = async () => {
      await fetchAdminEmails()
    }
    loadAdmins()
  }, [fetchAdminEmails])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
    }
    syncSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const nextHash = mode === 'admin' ? '#/admin' : '#/public'
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
    localStorage.setItem('appMode', mode)
  }, [mode])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleHashChange = () => {
      setMode(getModeFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleAdminSignIn = async () => {
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })
    if (error) {
      setLoginError(error.message || 'Sign in failed')
      return
    }
    const signedInUser = data?.user ?? null
    const email = signedInUser?.email?.toLowerCase()
    let authorized = false

    if (email) {
      authorized = Boolean(
        ADMIN_EMAILS.includes(email) ||
        signedInUser.user_metadata?.role === 'admin' ||
        adminEmails.includes(email)
      )
    }

    if (!authorized) {
      if (adminConfigured === null || adminLoading) {
        setLoginError('Checking admin configuration. Please try again in a moment.')
        return
      }
      if (email && adminConfigured === false) {
        const { error: insertError } = await supabase.from('admin_users').insert([{ email }])
        if (!insertError) {
          setAdminEmails([email])
          setAdminConfigured(true)
          authorized = true
        }
      }
    }

    if (!authorized) {
      await supabase.auth.signOut()
      setLoginError('Admin access is restricted to authorized users.')
      return
    }

    setUser(signedInUser)
    setLoginEmail('')
    setLoginPassword('')
    setConfirmPassword('')
    setMode('admin')
    showToast('Signed in as admin')
  }

  const handleAdminSignUp = async () => {
    setLoginError('')

    if (!loginEmail.trim() || !loginPassword || !confirmPassword) {
      setLoginError('Please fill in all sign-up fields.')
      return
    }
    if (loginPassword !== confirmPassword) {
      setLoginError('Passwords do not match.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setLoginError(error.message || 'Sign up failed')
      return
    }

    const email = loginEmail.trim().toLowerCase()
    if (adminConfigured === false && email) {
      const { error: insertError } = await supabase.from('admin_users').insert([{ email }])
      if (!insertError) {
        setAdminEmails([email])
        setAdminConfigured(true)
      }
    }

    setAuthMode('signin')
    setLoginPassword('')
    setConfirmPassword('')
    showToast('Account created. Please check your email and sign in.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMode('public')
    showToast('Signed out')
  }

  const handleSave = async (formData) => {
    const payload = { ...formData }

    if (!isAdmin) {
      if (!editingClient) {
        payload.name = payload.name ?? ''
        payload.contact = payload.contact ?? ''
      }
      delete payload.is_complete
      if (editingClient) {
        delete payload.username
        delete payload.password
      }
    }

    // Remove empty memory_card_size
    if (!payload.memory_card_size) {
      delete payload.memory_card_size
    }

    // For admin users, ensure is_complete is a proper boolean
    if (isAdmin && payload.is_complete !== undefined) {
      payload.is_complete = Boolean(payload.is_complete)
    } else if (isAdmin && (payload.is_complete === undefined || payload.is_complete === null)) {
      payload.is_complete = true
    }

    const performSave = async (currentPayload) => {
      if (editingClient) {
        return supabase
          .from('clients')
          .update(currentPayload)
          .eq('id', editingClient.id)
      }
      return supabase.from('clients').insert([currentPayload])
    }

    // Debug: log payload being sent so we can verify is_complete value
    console.log('Saving client payload:', payload)
    showToast('Saving record — is_complete=' + String(payload.is_complete), 'info')

    const saveResult = await performSave(payload)
    let error = saveResult.error
    const returnedData = saveResult.data
    console.log('Save result:', saveResult)

    // After saving, fetch the stored record to confirm what was persisted
    try {
      const clientId = editingClient ? editingClient.id : (returnedData && returnedData[0] && returnedData[0].id)
      if (clientId) {
        const { data: stored, error: fetchErr } = await supabase.from('clients').select('id,name,contact,is_complete').eq('id', clientId).maybeSingle()
        console.log('Fetch verification maybeSingle result:', { stored, fetchErr })
        if (fetchErr) {
          // Try a second fetch using .single()
          try {
            const { data: stored2, error: fetchErr2 } = await supabase.from('clients').select('*').eq('id', clientId).single()
            console.log('Fetch verification single result:', { stored2, fetchErr2 })
            if (fetchErr2) {
              showToast('Verify fetch error: ' + (fetchErr2.message || String(fetchErr2)), 'error')
            } else {
              showToast('Stored is_complete=' + String(stored2?.is_complete), 'info')
            }
          } catch (e) {
            console.log('Second fetch exception:', e)
            showToast('Verify fetch exception: ' + String(e), 'error')
          }
        } else {
          showToast('Stored is_complete=' + String(stored?.is_complete) + ' raw=' + JSON.stringify(stored), 'info')
        }
      }
    } catch (e) {
      console.log('Verification error:', e)
      showToast('Verification exception: ' + String(e), 'error')
    }
    if (error && /is_complete/.test(error.message || '') && /schema cache/.test(error.message || '')) {
      const retryPayload = { ...payload }
      delete retryPayload.is_complete
      const retryResult = await performSave(retryPayload)
      error = retryResult.error
    }

    if (error) {
      showToast((editingClient ? 'Failed to update: ' : 'Failed to save: ') + (error.message || error.code || 'unknown error'), 'error')
      return false
    }

    showToast(editingClient ? 'Client updated' : 'Client added')
    await fetchClients()
    return true
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      showToast('Only admin can delete records', 'error')
      return
    }
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); return }
    showToast('Record deleted', 'info')
    await fetchClients()
  }

  const handleOpenSubscriptionModal = (client) => {
    setEditingClient(client)
    setSubscriptionModalOpen(true)
  }

  const handleAddAdminEmail = async (email) => {
    const normalized = email.trim().toLowerCase()
    if (!normalized || !normalized.includes('@')) {
      showToast('Enter a valid email', 'error')
      return false
    }
    const { error } = await supabase.from('admin_users').insert([{ email: normalized }])
    if (error) {
      showToast('Failed to add admin: ' + (error.message || 'unknown error'), 'error')
      return false
    }
    setAdminEmails(prev => Array.from(new Set([...prev, normalized])))
    showToast('Admin added')
    return true
  }

  const handleRemoveAdminEmail = async (email) => {
    const { error } = await supabase.from('admin_users').delete().eq('email', email)
    if (error) {
      showToast('Failed to remove admin', 'error')
      return
    }
    setAdminEmails(prev => prev.filter(item => item !== email))
    showToast('Admin removed')
  }

  const filtered = clients.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const simMatch = Array.isArray(c.sims) && c.sims.some(s =>
      (s.number || '').toLowerCase().includes(q) ||
      (s.network || '').toLowerCase().includes(q)
    )
    const installerMatch = Array.isArray(c.installers)
      ? c.installers.some(i => (i || '').toLowerCase().includes(q))
      : (c.installer || '').toLowerCase().includes(q)
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q) ||
      installerMatch ||
      (c.system || '').toLowerCase().includes(q) ||
      (c.contact || '').toLowerCase().includes(q) ||
      simMatch

    )
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <Header count={clients.length} />

      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setMode('public')}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: 9,
            border: mode === 'public' ? '1px solid rgba(38,168,61,0.5)' : '1px solid var(--border2)',
            background: mode === 'public' ? 'rgba(38,168,61,0.12)' : 'var(--bg3)',
            color: mode === 'public' ? '#4ade6e' : 'var(--text2)',
            cursor: 'pointer', fontFamily: 'var(--font)',
            fontWeight: mode === 'public' ? 600 : 400, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Public
        </button>
        <button
          onClick={() => setMode('admin')}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: 9,
            border: mode === 'admin' ? '1px solid rgba(38,168,61,0.5)' : '1px solid var(--border2)',
            background: mode === 'admin' ? 'rgba(38,168,61,0.12)' : 'var(--bg3)',
            color: mode === 'admin' ? '#4ade6e' : 'var(--text2)',
            cursor: 'pointer', fontFamily: 'var(--font)',
            fontWeight: mode === 'admin' ? 600 : 400, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Admin
        </button>
      </div>

      {mode === 'admin' && isAdmin && (
        <>
          <div style={{ padding: '10px 14px', background: 'var(--accent-soft)', borderBottom: '1px solid var(--accent-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Signed in as admin
            </span>
            <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 8, padding: '6px 12px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12 }}>Sign Out</button>
          </div>
        </>
      )}

      <SearchBar value={search} onChange={setSearch} />

      {adminModalOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setAdminModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220, padding: 16 }}
        >
          <div style={{ width: 'min(100%, 480px)', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg)', borderRadius: 24, boxShadow: '0 25px 80px rgba(15, 23, 42, 0.25)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Management</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>Manage admin access from one place.</div>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                aria-label="Close admin management"
              >
                ×
              </button>
            </div>
            <AdminManager
              admins={adminEmails}
              loading={adminLoading}
              onAdd={handleAddAdminEmail}
              onRemove={handleRemoveAdminEmail}
            />
          </div>
        </div>
      )}
      <TabBar active={tab} onChange={setTab} isAdmin={mode === 'admin' && isAdmin} />

      <div style={{ flex: 1, padding: '12px 14px 90px' }}>
        {mode === 'admin' && !isAdmin ? (
          <div style={{ padding: 20, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', margin: '0' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--navy-soft)', border: '1px solid var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{authMode === 'signup' ? 'Admin Sign Up' : 'Admin Sign In'}</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>
                {authMode === 'signup'
                  ? 'Create an account and then ask an existing admin to approve your access.'
                  : 'Enter your credentials to access the full dashboard.'}
              </p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input
                type="email"
                placeholder="Admin email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(38,168,61,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(38,168,61,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }}
              />
              {authMode === 'signup' && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(38,168,61,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(38,168,61,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }}
                />
              )}
              <button
                onClick={authMode === 'signup' ? handleAdminSignUp : handleAdminSignIn}
                style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font)', fontSize: 15, boxShadow: '0 3px 12px rgba(38,168,61,0.35)' }}
              >
                {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin')
                  setLoginError('')
                  setConfirmPassword('')
                }}
                style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14 }}
              >
                {authMode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}
              </button>
              {loginError && <div style={{ color: '#f87171', fontSize: 13, textAlign: 'center', background: 'var(--red-soft)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{loginError}</div>}
            </div>
          </div>
        ) : tab === 'list' ? (
          <ClientList
            clients={filtered}
            loading={loading}
            searchActive={!!search.trim()}
            onEdit={(c) => { setEditingClient(c); setModalOpen(true) }}
            onDelete={handleDelete}
            onAddSubscription={handleOpenSubscriptionModal}
            subscriptionRefresh={subscriptionRefresh}
            isAdmin={mode === 'admin' && isAdmin}
          />
        ) : tab === 'stats' ? (
          <StatsView clients={clients} loading={loading} />
        ) : (
          <SubscriptionsView isAdmin={mode === 'admin' && isAdmin} />
        )}
      </div>

      {(mode === 'public' || isAdmin) && (
        <>
          {mode === 'admin' && isAdmin && (
            <button
              onClick={() => setAdminModalOpen(true)}
              aria-label="Open admin management"
              style={{
                position: 'fixed',
                right: 24,
                bottom: 152,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid var(--border2)',
                background: 'var(--bg2)',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                zIndex: 210,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="3" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle night mode"
            style={{
              position: 'fixed',
              right: 24,
              bottom: 96,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border2)',
              background: 'var(--bg2)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              zIndex: 210,
            }}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
          </button>
          <FAB onClick={() => { setEditingClient(null); setModalOpen(true) }} />
        </>
      )}

      {modalOpen && (
        <ClientModal
          key={editingClient?.id ?? 'new-client'}
          client={editingClient}
          onClose={() => { setModalOpen(false); setEditingClient(null) }}
          onSave={handleSave}
          isAdmin={mode === 'admin' && isAdmin}
        />
      )}

      {subscriptionModalOpen && editingClient && (
        <SubscriptionModal
          client={editingClient}
          onClose={() => setSubscriptionModalOpen(false)}
          onSave={() => {
            setSubscriptionModalOpen(false)
            setSubscriptionRefresh(prev => prev + 1)
            setEditingClient(null)
          }}
          onShowToast={showToast}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
