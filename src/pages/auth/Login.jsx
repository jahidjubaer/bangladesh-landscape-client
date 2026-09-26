import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, KeyRound, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../layouts/AuthShell';
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
    <AuthShell title={t('auth.loginTitle')}>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {serverError && (
            <div className="alert alert-error text-sm py-2" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="identifier">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {t('auth.identifier')}
                </span>
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
                <span className="label-text font-medium flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> {t('auth.password')}
                </span>
              </label>
              <input
                id="password"
                type="password"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: true })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-full gap-2 shadow-lg shadow-primary/25" disabled={isSubmitting}>
              <LogIn className="w-4 h-4" />
              {isSubmitting ? t('auth.loggingIn') : t('auth.loginBtn')}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="link link-primary font-medium">
              {t('auth.registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
