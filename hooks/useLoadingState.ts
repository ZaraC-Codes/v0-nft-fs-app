import { useState, useCallback } from "react"

export interface LoadingState {
  /** Whether the operation is currently loading */
  isLoading: boolean

  /** Error message if operation failed */
  error: string | null

  /** Start loading state */
  startLoading: () => void

  /** Stop loading state */
  stopLoading: () => void

  /** Set error and stop loading */
  setError: (error: string) => void

  /** Clear error */
  clearError: () => void

  /** Reset all state */
  reset: () => void

  /** Execute async operation with automatic loading state */
  execute: <T>(operation: () => Promise<T>) => Promise<T | null>
}

/**
 * useLoadingState - Unified loading state management
 *
 * Replaces inconsistent loading state variables (isLoading, loading, isSending, etc.)
 * with a consistent API.
 *
 * @example
 * ```tsx
 * const { isLoading, error, execute } = useLoadingState()
 *
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     await api.submitForm(data)
 *   })
 * }
 *
 * return (
 *   <Button disabled={isLoading}>
 *     {isLoading ? "Submitting..." : "Submit"}
 *   </Button>
 * )
 * ```
 */
export function useLoadingState(): LoadingState {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setErrorState(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const setError = useCallback((errorMsg: string) => {
    setErrorState(errorMsg)
    setIsLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setErrorState(null)
  }, [])

  const execute = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    startLoading()
    try {
      const result = await operation()
      stopLoading()
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setError(errorMsg)
      return null
    }
  }, [startLoading, stopLoading, setError])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset,
    execute,
  }
}

/**
 * useAsyncState - Manage async operation state
 *
 * Convenience hook for common async patterns with data, loading, and error.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsyncState<User>()
 *
 * useEffect(() => {
 *   execute(() => fetchUser(userId))
 * }, [userId])
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error message={error} />
 * if (!data) return null
 * return <UserProfile user={data} />
 * ```
 */
export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null)
  const loadingState = useLoadingState()

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    const result = await loadingState.execute(operation)
    if (result !== null) {
      setData(result)
    }
    return result
  }, [loadingState])

  const reset = useCallback(() => {
    setData(null)
    loadingState.reset()
  }, [loadingState])

  return {
    data,
    setData,
    ...loadingState,
    execute,
    reset,
  }
}
