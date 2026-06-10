export default function Toast({ msg, type }) {
  const styles = {
    success: { bg: 'rgba(38,168,61,0.15)', border: 'rgba(38,168,61,0.35)', color: '#4ade6e' },
    error:   { bg: 'var(--red-soft)',      border: 'rgba(239,68,68,0.35)',  color: '#f87171' },
    info:    { bg: 'var(--bg4)',           border: 'var(--border2)',        color: 'var(--text2)' },
  }
  const s = styles[type] || styles.success

  return (
    <div style={{
      position: 'fixed', bottom: 92, left: '50%', transform: 'translateX(-50%)',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600,
      zIndex: 400, whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow)',
      animation: 'slideUp 0.2s ease',
    }}>
      {msg}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  )
}
