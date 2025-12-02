import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'

const loginMock = vi.fn()
const clearErrorMock = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: loginMock,
    error: null,
    clearError: clearErrorMock,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    clearErrorMock.mockReset()
    mockNavigate.mockReset()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors when fields are empty', async () => {
    render(<LoginPage />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/Email or username is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument()
  })

  it('submits credentials and navigates to dashboard on success', async () => {
    loginMock.mockResolvedValueOnce({ user: { id: 1 } })
    render(<LoginPage />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/Email or Username/i), 'manager@example.com ')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('manager@example.com', 'password123')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
})
