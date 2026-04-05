import { createContext, useContext, useReducer, useCallback } from 'react'

const FileStoreContext = createContext(null)
const DispatchContext = createContext(null)

const initialState = {
  files: {},
  activeFileId: null,
  errors: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_FILE': {
      const { id, name, content } = action.payload
      const newFiles = {
        ...state.files,
        [id]: { id, name, content, addedAt: Date.now() },
      }
      return {
        ...state,
        files: newFiles,
        activeFileId: id,
        errors: { ...state.errors, [id]: null },
      }
    }
    case 'REMOVE_FILE': {
      const { id } = action.payload
      const { [id]: _, ...remainingFiles } = state.files
      const { [id]: __, ...remainingErrors } = state.errors
      let nextActiveId = state.activeFileId
      if (state.activeFileId === id) {
        const sorted = Object.values(remainingFiles).sort((a, b) => a.addedAt - b.addedAt)
        nextActiveId = sorted.length > 0 ? sorted[sorted.length - 1].id : null
      }
      return {
        ...state,
        files: remainingFiles,
        activeFileId: nextActiveId,
        errors: remainingErrors,
      }
    }
    case 'SET_ACTIVE': {
      return { ...state, activeFileId: action.payload.id }
    }
    case 'SET_ERROR': {
      const { id, error } = action.payload
      return { ...state, errors: { ...state.errors, [id]: error } }
    }
    case 'CLEAR_ERROR': {
      const { id } = action.payload
      return { ...state, errors: { ...state.errors, [id]: null } }
    }
    default:
      return state
  }
}

export function FileStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <FileStoreContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </FileStoreContext.Provider>
  )
}

export function useFileStore() {
  return useContext(FileStoreContext)
}

export function useFileDispatch() {
  return useContext(DispatchContext)
}

export function useFileActions() {
  const dispatch = useFileDispatch()

  const addFile = useCallback((name, content) => {
    const id = crypto.randomUUID()
    dispatch({ type: 'ADD_FILE', payload: { id, name, content } })
    return id
  }, [dispatch])

  const removeFile = useCallback((id) => {
    dispatch({ type: 'REMOVE_FILE', payload: { id } })
  }, [dispatch])

  const setActive = useCallback((id) => {
    dispatch({ type: 'SET_ACTIVE', payload: { id } })
  }, [dispatch])

  const setError = useCallback((id, error) => {
    dispatch({ type: 'SET_ERROR', payload: { id, error } })
  }, [dispatch])

  const clearError = useCallback((id) => {
    dispatch({ type: 'CLEAR_ERROR', payload: { id } })
  }, [dispatch])

  return { addFile, removeFile, setActive, setError, clearError }
}
