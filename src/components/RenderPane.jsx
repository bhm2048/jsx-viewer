import { useEffect, useRef, useState, useCallback } from 'react'
import { useFileStore, useFileActions } from '../state/useFileStore'
import { extractImports, buildImportMap } from '../iframe/importResolver'
import { generateSrcdoc } from '../iframe/template'
import ErrorPanel from './ErrorPanel'

function compileJSX(source) {
  const { imports, thirdPartyPackages } = extractImports(source)

  // Remove only the exact top-of-file import lines
  const lines = source.split('\n')
  const rawLines = new Set(imports.map((imp) => imp.raw))
  const bodyLines = []
  let pastImports = false
  for (const line of lines) {
    if (!pastImports && rawLines.has(line)) {
      continue // skip this import line
    }
    pastImports = true
    bodyLines.push(line)
  }
  let codeBody = bodyLines.join('\n')

  // Rebuild import statements for the iframe
  const importLines = []
  for (const imp of imports) {
    importLines.push(`import ${imp.specifiers} from "${imp.pkg}";`)
  }

  // Ensure React default import exists (Babel classic runtime needs it)
  if (!importLines.some((l) => /import\s+React[\s,]/.test(l) || /import\s+React\s+from/.test(l))) {
    importLines.unshift('import React from "react";')
  }

  // Extract component name from export default (only at the real top-level)
  let componentName = 'DefaultExport'
  // Match export default function Name at line start
  const exportDefaultFn = /^export\s+default\s+function\s+(\w+)/m.exec(codeBody)
  if (exportDefaultFn) {
    componentName = exportDefaultFn[1]
    // Only replace the FIRST occurrence
    codeBody = codeBody.slice(0, exportDefaultFn.index) +
      codeBody.slice(exportDefaultFn.index).replace(/^export\s+default\s+function/, 'function')
  } else {
    const exportDefault = /^export\s+default\s+(\w+)/m.exec(codeBody)
    if (exportDefault) {
      componentName = exportDefault[1]
      codeBody = codeBody.slice(0, exportDefault.index) +
        codeBody.slice(exportDefault.index).replace(/^export\s+default\s+\w+\s*;?/, '')
    }
  }

  // Compile JSX with Babel
  if (!window.Babel) {
    throw new Error('Babel Standalone is not loaded. Please check your internet connection.')
  }

  const result = window.Babel.transform(codeBody, {
    presets: ['react'],
    filename: 'component.jsx',
  })

  const importMap = buildImportMap(thirdPartyPackages)

  return {
    importStatements: importLines.join('\n'),
    compiledCode: result.code,
    componentName,
    importMap,
  }
}

export default function RenderPane() {
  const { files, activeFileId, errors } = useFileStore()
  const { setError, clearError } = useFileActions()
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const activeFile = activeFileId ? files[activeFileId] : null
  const activeError = activeFileId ? errors[activeFileId] : null

  const handleMessage = useCallback((event) => {
    if (!activeFileId) return
    if (event.data?.type === 'render-error') {
      setError(activeFileId, { message: event.data.message, stack: event.data.stack })
    } else if (event.data?.type === 'render-success') {
      clearError(activeFileId)
      setLoading(false)
    }
  }, [activeFileId, setError, clearError])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  useEffect(() => {
    if (!activeFile || !iframeRef.current) return

    setLoading(true)
    clearError(activeFileId)

    try {
      const { importStatements, compiledCode, componentName, importMap } = compileJSX(activeFile.content)
      const srcdoc = generateSrcdoc({ importMap, importStatements, compiledCode, componentName })
      iframeRef.current.srcdoc = srcdoc
    } catch (err) {
      setLoading(false)
      setError(activeFileId, {
        message: err.message,
        stack: err.stack || '',
      })
    }
  }, [activeFile, activeFileId, setError, clearError])

  if (!activeFile) {
    return (
      <div className="render-pane render-pane--empty">
        <div className="render-pane__placeholder">
          <div className="render-pane__placeholder-icon">&lt;/&gt;</div>
          <p>Drop a .jsx file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="render-pane">
      {loading && (
        <div className="render-pane__loading">
          <div className="render-pane__spinner" />
          Loading...
        </div>
      )}
      <ErrorPanel error={activeError} />
      <iframe
        ref={iframeRef}
        className="render-pane__iframe"
        sandbox="allow-scripts allow-same-origin allow-popups"
        title={activeFile.name}
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}
