import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInForm from '../SignInForm'

describe('SignInForm', () => {

  it('renders email input and submit button', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls sign in action with valid email', async () => {
    const user = userEvent.setup()
    const mockSignIn = jest.fn()

    render(<SignInForm signInAction={mockSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockSignIn).toHaveBeenCalledWith(expect.objectContaining({
      get: expect.any(Function)
    }))
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const slowSignIn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<SignInForm signInAction={slowSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
  })

  it('displays success message after submission', async () => {
    const user = userEvent.setup()
    const mockSignIn = jest.fn()

    render(<SignInForm signInAction={mockSignIn} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
  })
})