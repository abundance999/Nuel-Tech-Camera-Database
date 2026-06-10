export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add new client"
      style={{
        position: 'fixed', bottom: 28, right: 20,
        width: 54, height: 54, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow)',
        zIndex: 200,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = 'var(--shadow-strong)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
  )
}
