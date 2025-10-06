import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpForm from '../SignUpForm'

describe('SignUpForm', () => {
  it('renders username, email, password, and confirm password inputs', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid username (too short)', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()
    render(<SignUpForm signUpAction={mockSignUp} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/^email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(usernameInput, 'ab')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()
    render(<SignUpForm signUpAction={mockSignUp} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/^email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'notanemail')
    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()
    render(<SignUpForm signUpAction={mockSignUp} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/^email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmInput, 'password456')
    await user.click(submitButton)

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()
    render(<SignUpForm signUpAction={mockSignUp} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/^email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '12345')
    await user.type(confirmInput, '12345')
    await user.click(submitButton)

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('calls sign up action with valid data', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()

    render(<SignUpForm signUpAction={mockSignUp} />)

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      get: expect.any(Function)
    }))
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const slowSignUp = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<SignUpForm signUpAction={slowSignUp} />)

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
  })

  it('displays success message after submission', async () => {
    const user = userEvent.setup()
    const mockSignUp = jest.fn()

    render(<SignUpForm signUpAction={mockSignUp} />)

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/account created successfully/i)).toBeInTheDocument()
  })
})
