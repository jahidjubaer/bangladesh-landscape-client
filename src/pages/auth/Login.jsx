import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');
    try {
      await login(values.identifier, values.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="card bg-base-100 shadow-lg w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-4">{t('auth.loginTitle')}</h1>

          {serverError && (
            <div className="alert alert-error text-sm py-2" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="identifier">
                <span className="label-text">{t('auth.identifier')}</span>
              </label>
              <input
                id="identifier"
                type="text"
                placeholder={t('auth.phonePlaceholder')}
                className={`input input-bordered w-full ${errors.identifier ? 'input-error' : ''}`}
                {...register('identifier', { required: true })}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">{t('auth.password')}</span>
              </label>
              <input
                id="password"
                type="password"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: true })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.loggingIn') : t('auth.loginBtn')}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="link link-primary">
              {t('auth.registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
