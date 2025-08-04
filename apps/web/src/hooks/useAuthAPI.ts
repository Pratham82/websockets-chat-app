interface User {
  id: string
  username: string
  email: string
}

interface AuthResponse {
  message: string
  token: string
  user: User
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const useAuthAPI = () => {
  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    return data as AuthResponse
  }

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    return data as AuthResponse
  }

  return {
    login,
    register,
  }
}

export type { User, AuthResponse }
