import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../../services/api';
import { registerUser } from '../../services/auth';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

export default function Register() {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur', resolver: zodResolver(schema),
  });

  async function handleRegister(values) {
    setServerError('');
    try {
      const { confirmPassword, ...payload } = values;
      await registerUser(payload);
      navigate('/profile', { replace: true });
    } catch (error) {
      setServerError(getApiError(error));
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card border-0 shadow p-4">
            <h2 className="text-center mb-4">Create Account</h2>
            <form onSubmit={handleSubmit(handleRegister)} noValidate>
              <div className="mb-3">
                <label htmlFor="register-name" className="form-label">Full Name</label>
                <input id="register-name" className="form-control" placeholder="Enter your name" autoComplete="name" {...register('name')} />
                {errors.name && <small className="text-danger">{errors.name.message}</small>}
              </div>
              <div className="mb-3">
                <label htmlFor="register-email" className="form-label">Email address</label>
                <input id="register-email" type="email" className="form-control" placeholder="name@example.com" autoComplete="email" {...register('email')} />
                {errors.email && <small className="text-danger">{errors.email.message}</small>}
              </div>
              <div className="mb-3">
                <label htmlFor="register-password" className="form-label">Password</label>
                <input id="register-password" type="password" className="form-control" placeholder="At least 8 characters" autoComplete="new-password" {...register('password')} />
                {errors.password && <small className="text-danger">{errors.password.message}</small>}
              </div>
              <div className="mb-3">
                <label htmlFor="register-confirm" className="form-label">Confirm Password</label>
                <input id="register-confirm" type="password" className="form-control" placeholder="Repeat your password" autoComplete="new-password" {...register('confirmPassword')} />
                {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword.message}</small>}
              </div>
              {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Register'}</button>
              <p className="text-center mt-3 mb-0">Already have an account? <Link to="/login">Login</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
