import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TabBar from './components/TabBar'
import ClientList from './components/ClientList'
import StatsView from './components/StatsView'
import ClientModal from './components/ClientModal'
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
  const [editingClient, setEditingClient] = useState(null)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [adminEmails, setAdminEmails] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminConfigured, setAdminConfigured] = useState(null)

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
    setMode('admin')
    showToast('Signed in as admin')
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
      delete payload.name
      delete payload.contact
      if (editingClient) {
        delete payload.username
        delete payload.password
      }
    }

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editingClient.id)
      if (error) { showToast('Failed to update', 'error'); return false }
      showToast('Client updated')
    } else {
      const { error } = await supabase.from('clients').insert([payload])
      if (error) { showToast('Failed to save', 'error'); return false }
      showToast('Client added')
    }

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

      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setMode('public')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: mode === 'public' ? '1px solid var(--accent)' : '1px solid var(--border2)',
            background: mode === 'public' ? 'rgba(37,99,235,0.12)' : 'var(--bg3)',
            color: mode === 'public' ? '#60a5fa' : 'var(--text2)',
            cursor: 'pointer',
            fontFamily: 'var(--font)',
            fontWeight: mode === 'public' ? 600 : 500,
          }}
        >
          Public
        </button>
        <button
          onClick={() => setMode('admin')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: mode === 'admin' ? '1px solid var(--accent)' : '1px solid var(--border2)',
            background: mode === 'admin' ? 'rgba(37,99,235,0.12)' : 'var(--bg3)',
            color: mode === 'admin' ? '#60a5fa' : 'var(--text2)',
            cursor: 'pointer',
            fontFamily: 'var(--font)',
            fontWeight: mode === 'admin' ? 600 : 500,
          }}
        >
          Admin
        </button>
      </div>

      {mode === 'admin' && isAdmin && (
        <>
          <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#60a5fa', fontSize: 13 }}>Signed in as admin</span>
            <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font)' }}>Sign Out</button>
          </div>
          <AdminManager
            admins={adminEmails}
            loading={adminLoading}
            onAdd={handleAddAdminEmail}
            onRemove={handleRemoveAdminEmail}
          />
        </>
      )}

      <SearchBar value={search} onChange={setSearch} />
      <TabBar active={tab} onChange={setTab} />

      <div style={{ flex: 1, padding: '12px 14px 90px' }}>
        {mode === 'admin' && !isAdmin ? (
          <div style={{ padding: 20, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)', margin: '0 14px' }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Admin Sign In</h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Enter admin credentials to access the full dashboard.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <input
                type="email"
                placeholder="Admin email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)' }}
              />
              <button
                onClick={handleAdminSignIn}
                style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign In
              </button>
              {loginError && <div style={{ color: '#f87171', fontSize: 13 }}>{loginError}</div>}
            </div>
          </div>
        ) : (
          tab === 'list' ? (
            <ClientList
              clients={filtered}
              loading={loading}
              searchActive={!!search.trim()}
              onEdit={(c) => { setEditingClient(c); setModalOpen(true) }}
              onDelete={handleDelete}
              isAdmin={mode === 'admin' && isAdmin}
            />
          ) : (
            <StatsView clients={clients} loading={loading} />
          )
        )}
      </div>

      {(mode === 'public' || isAdmin) && (
        <FAB onClick={() => { setEditingClient(null); setModalOpen(true) }} />
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

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
