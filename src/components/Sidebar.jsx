import { useFileStore } from '../state/useFileStore'
import TabItem from './TabItem'
import DropZone from './DropZone'

export default function Sidebar() {
  const { files } = useFileStore()
  const sortedFiles = Object.values(files).sort((a, b) => a.addedAt - b.addedAt)

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">JSX Viewer</h1>
      </div>
      <div className="sidebar__tabs">
        {sortedFiles.map((file) => (
          <TabItem key={file.id} file={file} />
        ))}
      </div>
      <div className="sidebar__drop">
        <DropZone />
      </div>
    </aside>
  )
}
