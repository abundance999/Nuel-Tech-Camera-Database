import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TabBar from './components/TabBar'
import ClientList from './components/ClientList'
import StatsView from './components/StatsView'
import ClientModal from './components/ClientModal'
import FAB from './components/FAB'
import Toast from './components/Toast'
import './index.css'

export default function App() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [toast, setToast] = useState(null)

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

  const handleSave = async (formData) => {
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', editingClient.id)
      if (error) { showToast('Failed to update', 'error'); return false }
      showToast('Client updated')
    } else {
      const { error } = await supabase.from('clients').insert([formData])
      if (error) { showToast('Failed to save', 'error'); return false }
      showToast('Client added')
    }
    await fetchClients()
    return true
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); return }
    showToast('Record deleted', 'info')
    await fetchClients()
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
      <SearchBar value={search} onChange={setSearch} />
      <TabBar active={tab} onChange={setTab} />

      <div style={{ flex: 1, padding: '12px 14px 90px' }}>
        {tab === 'list' ? (
          <ClientList
            clients={filtered}
            loading={loading}
            searchActive={!!search.trim()}
            onEdit={(c) => { setEditingClient(c); setModalOpen(true) }}
            onDelete={handleDelete}
          />
        ) : (
          <StatsView clients={clients} loading={loading} />
        )}
      </div>

      <FAB onClick={() => { setEditingClient(null); setModalOpen(true) }} />

      {modalOpen && (
        <ClientModal
          key={editingClient?.id ?? 'new-client'}
          client={editingClient}
          onClose={() => { setModalOpen(false); setEditingClient(null) }}
          onSave={handleSave}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
