import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AnalyticsPage from './AnalyticsPage'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('AnalyticsPage', () => {
  it('renders analytics page with key metrics', async () => {
    const wrapper = createWrapper()
    render(<AnalyticsPage />, { wrapper })

    // Wait for loading to finish and data to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /Analytics/i })).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument()
      expect(screen.getByText(/Total Orders/i)).toBeInTheDocument()
      expect(screen.getByText(/Food Cost Ratio/i)).toBeInTheDocument()
    })
  })
})
