export default function Toast({ msg, type }) {
  const colors = {
    success: { bg: 'var(--green-soft)', border: 'rgba(16,185,129,0.25)', color: '#34d399' },
    error:   { bg: 'var(--red-soft)',   border: 'rgba(239,68,68,0.25)',  color: '#f87171' },
    info:    { bg: 'var(--bg4)',        border: 'var(--border2)',         color: 'var(--text2)' },
  }
  const c = colors[type] || colors.success

  return (
    <div style={{
      position: 'fixed',
      bottom: 92,
      left: '50%',
      transform: 'translateX(-50%)',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      borderRadius: 10,
      padding: '10px 18px',
      fontSize: 13,
      fontWeight: 500,
      zIndex: 400,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.2s ease',
    }}>
      {msg}
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  )
}
