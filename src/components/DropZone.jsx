import { useState, useRef } from 'react'
import { useFileActions } from '../state/useFileStore'

export default function DropZone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef(null)
  const { addFile } = useFileActions()

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach((file) => {
      if (file.name.endsWith('.jsx') || file.name.endsWith('.tsx')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          addFile(file.name, e.target.result)
        }
        reader.readAsText(file)
      }
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onBrowse = () => {
    inputRef.current?.click()
  }

  const onInputChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drop-zone--active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="drop-zone__icon">+</div>
      <div className="drop-zone__text">
        {isDragOver ? 'Drop here' : 'Drop .jsx files'}
      </div>
      <button className="drop-zone__btn" onClick={onBrowse}>
        Browse
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jsx,.tsx"
        multiple
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
    </div>
  )
}
