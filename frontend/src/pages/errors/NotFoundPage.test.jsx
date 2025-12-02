import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotFoundPage from './NotFoundPage'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('NotFoundPage', () => {
  it('renders message and navigates home', async () => {
    render(<NotFoundPage />)

    expect(screen.getByText(/Page not found/i)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Back to dashboard/i }))
    expect(navigateMock).toHaveBeenCalledWith('/dashboard')
  })
})
