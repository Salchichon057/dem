import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  immediate?: boolean
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  endpoint: string, 
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la API')
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [endpoint])

  const postData = async (body: unknown) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la API')
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  return {
    ...state,
    refetch: fetchData,
    post: postData
  }
}
