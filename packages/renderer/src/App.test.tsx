import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should render workbench title', () => {
    render(<App />)
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should NOT show export button initially (No-Fake)', () => {
    render(<App />)
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument()
  })

  it('should NOT show Crafty button initially (No-Fake)', () => {
    render(<App />)
    expect(screen.queryByText(/crafty/i)).not.toBeInTheDocument()
  })
})
