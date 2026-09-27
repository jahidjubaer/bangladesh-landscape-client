import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../layouts/AuthShell';
import { t } from '../../i18n';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');
    try {
      await registerUser({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        password: values.password,
        ref: refCode || undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <AuthShell title={t('auth.registerTitle')}>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {refCode && <div className="alert alert-success text-sm py-2">🎁 {t('referral.applied')}</div>}
          {serverError && (
            <div className="alert alert-error text-sm py-2" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text">{t('auth.name')}</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder={t('auth.namePlaceholder')}
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: true, minLength: 2 })}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="phone">
                <span className="label-text">{t('auth.phone')}</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                {...register('phone', { required: true, pattern: /^(\+?880|0)1[3-9]\d{8}$/ })}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">{t('auth.email')}</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                className="input input-bordered w-full"
                {...register('email')}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text">{t('auth.password')}</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: true, minLength: 6 })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-full gap-2 shadow-lg shadow-primary/25" disabled={isSubmitting}>
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? t('auth.registering') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="link link-primary font-medium">
              {t('auth.loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
