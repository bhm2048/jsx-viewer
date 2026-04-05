import { FileStoreProvider } from './state/useFileStore'
import Sidebar from './components/Sidebar'
import RenderPane from './components/RenderPane'

export default function App() {
  return (
    <FileStoreProvider>
      <div className="app">
        <Sidebar />
        <RenderPane />
      </div>
    </FileStoreProvider>
  )
}
