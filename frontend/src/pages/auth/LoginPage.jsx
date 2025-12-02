import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Container, Form, Row, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const rememberKey = 'dbms-remember-identifier'

const validationSchema = yup.object().shape({
  identifier: yup.string().required('Email or username is required'),
  password: yup.string().required('Password is required'),
  remember: yup.boolean(),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error, clearError } = useAuth()
  const [submitError, setSubmitError] = useState(null)

  const rememberedIdentifier = useMemo(() => localStorage.getItem(rememberKey) || '', [])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      identifier: rememberedIdentifier,
      password: '',
      remember: Boolean(rememberedIdentifier),
    },
  })

  const [rememberChecked, setRememberChecked] = useState(Boolean(rememberedIdentifier))
  const rememberRegister = register('remember')

  useEffect(() => {
    clearError()
    return () => clearError()
  }, [clearError])

  const onSubmit = async ({ identifier, password, remember }) => {
    setSubmitError(null)
    try {
      const normalizedIdentifier = identifier.trim()
      await login(normalizedIdentifier, password)

      if (remember) {
        localStorage.setItem(rememberKey, normalizedIdentifier)
      } else {
        localStorage.removeItem(rememberKey)
      }

      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
      reset({ identifier: remember ? normalizedIdentifier : '', password: '', remember })
      setRememberChecked(remember)
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.'
      setSubmitError(message)
      setError('password', { type: 'server', message })
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="brand-gradient d-inline-flex px-4 py-2 rounded-pill fw-semibold mb-3">DBMS</div>
                  <h4 className="fw-semibold mb-1">Welcome back</h4>
                  <p className="text-muted mb-0">Sign in to access your dashboard</p>
                </div>

                {(submitError || error) && (
                  <Alert variant="danger" data-testid="login-error">
                    {submitError || error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Form.Group className="mb-3" controlId="identifier">
                    <Form.Label>Email or Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="manager@example.com"
                      autoComplete="username"
                      isInvalid={Boolean(errors.identifier)}
                      {...register('identifier')}
                    />
                    <Form.Control.Feedback type="invalid">{errors.identifier?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label>Password</Form.Label>
                      <Button variant="link" className="p-0 text-decoration-none" size="sm">
                        Forgot password?
                      </Button>
                    </div>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      isInvalid={Boolean(errors.password)}
                      {...register('password')}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="remember"
                      label="Remember me"
                      {...rememberRegister}
                      checked={rememberChecked}
                      onChange={(event) => {
                        const { checked } = event.target
                        setRememberChecked(checked)
                        if (!checked) {
                          localStorage.removeItem(rememberKey)
                        }
                        rememberRegister.onChange(event)
                      }}
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting ? (
                        <span className="d-inline-flex align-items-center gap-2">
                          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                          Signing in…
                        </span>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LoginPage
