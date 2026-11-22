import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../../services/api';
import { loginUser } from '../../services/auth';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/profile';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  async function handleLogin(values) {
    setServerError('');
    try {
      await loginUser(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getApiError(error));
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow p-4">
            <h2 className="text-center mb-4">Login Account</h2>
            <form onSubmit={handleSubmit(handleLogin)} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="login-email">Email address</label>
                <input id="login-email" type="email" className="form-control" placeholder="name@example.com" autoComplete="email" {...register('email')} />
                {errors.email && <small className="text-danger">{errors.email.message}</small>}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input id="login-password" type="password" className="form-control" placeholder="Enter your password" autoComplete="current-password" {...register('password')} />
                {errors.password && <small className="text-danger">{errors.password.message}</small>}
              </div>
              {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</button>
              <p className="text-center mt-3 mb-0">Don't have an account? <Link to="/register">Register</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
