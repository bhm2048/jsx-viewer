import { useFileStore, useFileActions } from '../state/useFileStore'

export default function TabItem({ file }) {
  const { activeFileId } = useFileStore()
  const { setActive, removeFile } = useFileActions()
  const isActive = activeFileId === file.id

  return (
    <div
      className={`tab-item ${isActive ? 'tab-item--active' : ''}`}
      onClick={() => setActive(file.id)}
    >
      <span className="tab-item__name" title={file.name}>
        {file.name}
      </span>
      <button
        className="tab-item__close"
        onClick={(e) => {
          e.stopPropagation()
          removeFile(file.id)
        }}
      >
        &times;
      </button>
    </div>
  )
}
