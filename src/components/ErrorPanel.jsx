export default function ErrorPanel({ error }) {
  if (!error) return null

  return (
    <div className="error-panel">
      <div className="error-panel__header">Compilation Error</div>
      <pre className="error-panel__message">{error.message}</pre>
      {error.stack && (
        <pre className="error-panel__stack">{error.stack}</pre>
      )}
    </div>
  )
}
