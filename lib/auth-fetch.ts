export async function authFetch(url: string, options: RequestInit = {}) {
    // Obtener token de localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null

    // Agregar Authorization header si hay token
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
    }

    return fetch(url, {
        ...options,
        headers
    })
}
