import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePlan, useUnlockPlan, useInitPayment } from '../../features/plans/queries';
import { useSubmitManualBkash } from '../../features/guides/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import NotFound from '../NotFound';
import api from '../../lib/axios';
import { t } from '../../i18n';

const money = (n) => `${Number(n || 0).toLocaleString('bn-BD')} ৳`;

function BkashManualBox({ publicId, bkashNumber, planPrice }) {
  const submit = useSubmitManualBkash();
  const [form, setForm] = useState({ trxId: '', senderNumber: '' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function copyNumber() {
    navigator.clipboard.writeText(bkashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await submit.mutateAsync({ planPublicId: publicId, ...form });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-300 rounded-xl p-4 text-left w-full max-w-md">
      <h3 className="font-bold text-pink-700 dark:text-pink-400 mb-2">📱 {t('bkash.payTitle')}</h3>
      <ol className="list-decimal ms-5 text-sm space-y-1 mb-3">
        <li>
          {t('bkash.step1')}:{' '}
          <button type="button" onClick={copyNumber} className="btn btn-xs btn-outline font-mono">
            {bkashNumber} 📋
          </button>{' '}
          {copied && <span className="text-success">{t('bkash.copied')}</span>}
          <strong className="ms-1">({money(planPrice)})</strong>
        </li>
        <li>{t('bkash.step2')}</li>
        <li>{t('bkash.step3')}</li>
      </ol>
      {error && <div className="alert alert-error text-sm py-1 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          required
          minLength={6}
          placeholder={t('bkash.trxId')}
          className="input input-bordered input-sm flex-1 min-w-32"
          value={form.trxId}
          onChange={(e) => setForm({ ...form, trxId: e.target.value })}
        />
        <input
          required
          placeholder={t('bkash.senderNumber')}
          className="input input-bordered input-sm flex-1 min-w-32"
          value={form.senderNumber}
          onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={submit.isPending}>
          {submit.isPending ? t('bkash.submitting') : t('bkash.submit')}
        </button>
      </form>
    </div>
  );
}

function DayCard({ day }) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="card-title text-base">
            <span className="badge badge-primary">{t('plan.day')} {day.dayNumber}</span> {day.title}
          </h3>
          <span className="badge badge-warning whitespace-nowrap">≈ {money(day.costEstimate)}</span>
        </div>
        <ul className="list-disc ms-5 space-y-1 text-base-content/85">
          {(day.activities || []).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
        <div className="text-sm text-base-content/70 space-y-1 mt-2">
          {day.meals && <div>🍲 <strong>{t('plan.meals')}:</strong> {day.meals}</div>}
          {day.stay && <div>🛏️ <strong>{t('plan.stayLabel')}:</strong> {day.stay}</div>}
          {day.transport && <div>🚌 <strong>{t('plan.transport')}:</strong> {day.transport}</div>}
        </div>
      </div>
    </div>
  );
}

export default function PlanView() {
  const { publicId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentResult = searchParams.get('payment');
  const { user } = useAuth();
  const { data, isLoading, isError } = usePlan(publicId);
  const unlock = useUnlockPlan();
  const initPay = useInitPayment();
  const [actionError, setActionError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [publicId]);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !data) return <NotFound />;

  const { plan, isOwner, planPrice, freeCredits, pendingVerification, paymentOptions } = data;
  const o = plan.output;
  const locked = plan.isPreview;
  const hiddenDays = locked ? (o.totalDays || 0) - (o.days?.length || 0) : 0;

  async function handleUnlock() {
    setActionError('');
    try {
      await unlock.mutateAsync(publicId);
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.error'));
    }
  }

  async function handlePay() {
    setActionError('');
    try {
      const { gatewayUrl } = await initPay.mutateAsync(publicId);
      window.location.href = gatewayUrl;
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.error'));
    }
  }

  async function handleDownload() {
    setActionError('');
    setDownloading(true);
    try {
      const res = await api.get(`/plans/${publicId}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${o.title || 'tour-plan'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.error'));
    } finally {
      setDownloading(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.origin + `/plans/${publicId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {paymentResult === 'success' && <div className="alert alert-success">✅ {t('plan.paymentSuccess')}</div>}
      {(paymentResult === 'failed' || paymentResult === 'cancelled') && (
        <div className="alert alert-error">{t('plan.paymentFailed')}</div>
      )}

      {/* Header */}
      <div className="card bg-gradient-to-br from-primary to-emerald-800 text-primary-content shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <span className={`badge ${locked ? 'badge-warning' : 'badge-success'}`}>
              {locked ? `🔒 ${t('plan.previewBadge')}` : `✓ ${t('plan.paidBadge')}`}
            </span>
            <button onClick={handleShare} className="btn btn-xs btn-ghost">
              {copied ? t('plan.copied') : `🔗 ${t('plan.share')}`}
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{o.title}</h1>
          <p className="opacity-90">{o.summary}</p>
          <div className="flex flex-wrap gap-2 text-sm mt-2">
            <span className="badge badge-outline border-primary-content/40">📍 {plan.district?.name?.bn}</span>
            <span className="badge badge-outline border-primary-content/40">👥 {plan.input.members} জন</span>
            <span className="badge badge-outline border-primary-content/40">🗓️ {plan.input.days} দিন {plan.input.nights} রাত</span>
            <span className="badge badge-outline border-primary-content/40">💰 {money(plan.input.budget)}</span>
          </div>
        </div>
      </div>

      {o.budgetVerdict && (
        <div className="alert">
          <span>💡 <strong>{t('plan.budgetVerdict')}:</strong> {o.budgetVerdict}</span>
        </div>
      )}

      {/* Map */}
      {o.mapPoints?.length > 0 && (
        <SpotMap
          center={plan.district?.mapCenter || { lat: o.mapPoints[0].lat, lng: o.mapPoints[0].lng }}
          zoom={plan.district?.zoom || 10}
          markers={o.mapPoints.map((p) => ({ lat: p.lat, lng: p.lng, nameBn: `${p.order}. ${p.name}` }))}
          height="320px"
        />
      )}

      {/* Days */}
      <div className="space-y-4">
        {(o.days || []).map((d) => (
          <DayCard key={d.dayNumber} day={d} />
        ))}
        {hiddenDays > 0 && (
          <div className="card bg-base-100 shadow-md border-2 border-dashed border-base-300">
            <div className="card-body items-center text-center text-base-content/60">
              🔒 {t('plan.moreDays').replace('{n}', hiddenDays)}
            </div>
          </div>
        )}
      </div>

      {/* Unlock box */}
      {locked && (
        <div className="card bg-base-100 shadow-lg border-2 border-primary">
          <div className="card-body items-center text-center">
            <h2 className="card-title">🔓 {t('plan.unlockTitle')} — {money(planPrice)}</h2>
            <p className="text-base-content/70">{t('plan.unlockDesc')}</p>
            {actionError && <div className="alert alert-error text-sm py-2">{actionError}</div>}
            {isOwner ? (
              pendingVerification ? (
                <div className="alert alert-info text-sm">⏳ {t('bkash.pending')}</div>
              ) : (
                <div className="flex flex-col items-center gap-3 mt-2 w-full">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {freeCredits > 0 && (
                      <button onClick={handleUnlock} className="btn btn-secondary" disabled={unlock.isPending}>
                        🎁 {t('plan.freeCreditBtn')} ({t('plan.freeCreditsLeft')}: {freeCredits})
                      </button>
                    )}
                    {paymentOptions?.online && (
                      <button onClick={handlePay} className="btn btn-primary" disabled={initPay.isPending}>
                        💳 {t('plan.payBtn')} ({money(planPrice)})
                      </button>
                    )}
                  </div>
                  {paymentOptions?.bkashNumber && (
                    <BkashManualBox publicId={publicId} bkashNumber={paymentOptions.bkashNumber} planPrice={planPrice} />
                  )}
                </div>
              )
            ) : (
              <p className="text-sm">{user ? '' : t('plan.loginRequired')}</p>
            )}
          </div>
        </div>
      )}

      {/* Full content */}
      {!locked && (
        <>
          {o.costBreakdown?.length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">💰 {t('plan.costBreakdown')}</h2>
                <table className="table">
                  <tbody>
                    {o.costBreakdown.map((c, i) => (
                      <tr key={i}>
                        <td>{c.item}</td>
                        <td className="text-right">{money(c.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td>{t('plan.total')}</td>
                      <td className="text-right">{money(o.totalCostEstimate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {o.hiddenPlaces?.length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">💎 {t('plan.hiddenPlaces')}</h2>
                <ul className="list-disc ms-5 space-y-1">{o.hiddenPlaces.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </div>
            </div>
          )}

          {o.warnings?.length > 0 && (
            <div className="alert alert-warning items-start">
              <div>
                <h3 className="font-bold mb-1">⚠️ {t('district.warnings')}</h3>
                <ul className="list-disc ms-5 space-y-1">{o.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            </div>
          )}

          {o.tips?.length > 0 && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">💡 {t('plan.tips')}</h2>
                <ul className="list-disc ms-5 space-y-1">{o.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="text-center">
              {actionError && <div className="alert alert-error text-sm py-2 mb-3">{actionError}</div>}
              <button onClick={handleDownload} className="btn btn-primary btn-lg" disabled={downloading}>
                {downloading ? <span className="loading loading-spinner loading-sm"></span> : '⬇️'} {t('plan.downloadPdf')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
