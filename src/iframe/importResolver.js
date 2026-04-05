const REACT_VERSION = '18.3.1'

const BUILTIN_PACKAGES = {
  'react': `https://esm.sh/react@${REACT_VERSION}`,
  'react/': `https://esm.sh/react@${REACT_VERSION}/`,
  'react-dom': `https://esm.sh/react-dom@${REACT_VERSION}?external=react`,
  'react-dom/': `https://esm.sh/react-dom@${REACT_VERSION}&external=react/`,
  'react-dom/client': `https://esm.sh/react-dom@${REACT_VERSION}/client?external=react`,
}

const IMPORT_LINE_RE = /^import\s+(.+?)\s+from\s+['"]([^./][^'"]*)['"]\s*;?\s*$/

export function extractImports(jsxSource) {
  const lines = jsxSource.split('\n')
  const imports = []
  const thirdPartyPackages = new Set()

  // Only scan the top of the file: imports must be contiguous at the top
  // (blank lines and single-line comments are allowed between them)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue

    const match = IMPORT_LINE_RE.exec(trimmed)
    if (!match) break  // first non-import line → stop scanning

    const specifiers = match[1]
    const pkg = match[2]
    imports.push({ specifiers, pkg, raw: line })

    const isReact = pkg === 'react' || pkg.startsWith('react/') || pkg.startsWith('react-dom')
    if (!isReact) {
      const basePkg = pkg.includes('/') ? pkg.split('/')[0] : pkg
      thirdPartyPackages.add(basePkg)
    }
  }

  return { imports, thirdPartyPackages }
}

export function buildImportMap(thirdPartyPackages) {
  const imports = { ...BUILTIN_PACKAGES }

  for (const pkg of thirdPartyPackages) {
    imports[pkg] = `https://esm.sh/${pkg}?external=react,react-dom`
    imports[`${pkg}/`] = `https://esm.sh/${pkg}&external=react,react-dom/`
  }

  return { imports }
}
