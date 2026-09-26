import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Lock, LockOpen, Share2, Check, Download, Gift, CreditCard, MapPin, Users,
  CalendarDays, Wallet, UtensilsCrossed, BedDouble, Bus, Lightbulb, Gem,
  AlertTriangle, ReceiptText, Smartphone, Copy, Hourglass,
} from 'lucide-react';
import { usePlan, useUnlockPlan, useInitPayment } from '../../features/plans/queries';
import { useSubmitManualBkash } from '../../features/guides/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import SpotMap from '../../components/SpotMap';
import Seo from '../../components/Seo';
import Reveal from '../../components/ui/Reveal';
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
    <div className="rounded-2xl border-2 border-pink-400/40 bg-pink-500/5 p-5 text-left w-full max-w-md">
      <h3 className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2 mb-3">
        <Smartphone className="w-5 h-5" /> {t('bkash.payTitle')}
      </h3>
      <ol className="text-sm space-y-2.5 mb-4">
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">১</span>
          <span>
            {t('bkash.step1')}:{' '}
            <button type="button" onClick={copyNumber} className="btn btn-xs btn-outline gap-1 font-mono align-middle">
              {bkashNumber} {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </button>{' '}
            <strong>({money(planPrice)})</strong>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">২</span>
          {t('bkash.step2')}
        </li>
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">৩</span>
          {t('bkash.step3')}
        </li>
      </ol>
      {error && <div className="alert alert-error text-sm py-1.5 mb-2">{error}</div>}
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

function TimelineDay({ day, isLast }) {
  return (
    <Reveal className="relative ps-14">
      {/* Timeline line + dot */}
      {!isLast && <span className="absolute left-[1.19rem] top-12 bottom-[-1rem] w-0.5 bg-primary/25" aria-hidden />}
      <span className="absolute left-0 top-1 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content font-bold flex items-center justify-center shadow-md shadow-primary/25">
        {Number(day.dayNumber).toLocaleString('bn-BD')}
      </span>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-5">
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{day.title}</h3>
            <span className="badge badge-warning gap-1 whitespace-nowrap">
              <Wallet className="w-3 h-3" /> ≈ {money(day.costEstimate)}
            </span>
          </div>
          <ul className="space-y-1.5 text-base-content/80 mt-1">
            {(day.activities || []).map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {a}
              </li>
            ))}
          </ul>
          <div className="grid sm:grid-cols-3 gap-2 text-sm text-base-content/65 mt-3 pt-3 border-t border-base-200">
            {day.meals && <div className="flex gap-1.5"><UtensilsCrossed className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {day.meals}</div>}
            {day.stay && <div className="flex gap-1.5"><BedDouble className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {day.stay}</div>}
            {day.transport && <div className="flex gap-1.5 sm:col-span-3"><Bus className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {day.transport}</div>}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <Reveal>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </span>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </Reveal>
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

  const metaChips = [
    { Icon: MapPin, text: plan.district?.name?.bn },
    { Icon: Users, text: `${Number(plan.input.members).toLocaleString('bn-BD')} জন` },
    { Icon: CalendarDays, text: `${Number(plan.input.days).toLocaleString('bn-BD')} দিন ${Number(plan.input.nights).toLocaleString('bn-BD')} রাত` },
    { Icon: Wallet, text: money(plan.input.budget) },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Seo title={o.title} description={o.summary} />

      {paymentResult === 'success' && <div className="alert alert-success"><Check className="w-5 h-5" /> {t('plan.paymentSuccess')}</div>}
      {(paymentResult === 'failed' || paymentResult === 'cancelled') && (
        <div className="alert alert-error"><AlertTriangle className="w-5 h-5" /> {t('plan.paymentFailed')}</div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2622] via-[#0d3a32] to-primary text-neutral-content shadow-xl p-7 md:p-9"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/15 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="flex justify-between items-start gap-2 flex-wrap mb-4">
            <span className={`badge gap-1.5 ${locked ? 'badge-warning' : 'badge-success'}`}>
              {locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
              {locked ? t('plan.previewBadge') : t('plan.paidBadge')}
            </span>
            <button onClick={handleShare} className="btn btn-xs btn-ghost gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? t('plan.copied') : t('plan.share')}
            </button>
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold mb-3">{o.title}</h1>
          <p className="opacity-85 leading-relaxed mb-5">{o.summary}</p>
          <div className="flex flex-wrap gap-2">
            {metaChips.map(({ Icon, text }) => (
              <span key={text} className="badge badge-outline border-neutral-content/30 gap-1.5 py-3">
                <Icon className="w-3.5 h-3.5" /> {text}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {o.budgetVerdict && (
        <Reveal>
          <div className="alert bg-info/10 border-info/30">
            <Lightbulb className="w-5 h-5 text-info" />
            <span><strong>{t('plan.budgetVerdict')}:</strong> {o.budgetVerdict}</span>
          </div>
        </Reveal>
      )}

      {/* Map */}
      {o.mapPoints?.length > 0 && (
        <Reveal>
          <SpotMap
            center={plan.district?.mapCenter || { lat: o.mapPoints[0].lat, lng: o.mapPoints[0].lng }}
            zoom={plan.district?.zoom || 10}
            markers={o.mapPoints.map((p) => ({ lat: p.lat, lng: p.lng, nameBn: `${p.order}. ${p.name}` }))}
            height="320px"
          />
        </Reveal>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {(o.days || []).map((d, i) => (
          <TimelineDay key={d.dayNumber} day={d} isLast={i === (o.days?.length || 0) - 1 && hiddenDays === 0} />
        ))}
        {hiddenDays > 0 && (
          <Reveal className="relative ps-14">
            <span className="absolute left-0 top-1 w-10 h-10 rounded-2xl bg-base-300 text-base-content/50 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </span>
            <div className="card border-2 border-dashed border-base-300 bg-base-100/60">
              <div className="card-body items-center text-center text-base-content/55 py-8">
                <Lock className="w-6 h-6 mb-1" />
                {t('plan.moreDays').replace('{n}', Number(hiddenDays).toLocaleString('bn-BD'))}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {/* Unlock box */}
      {locked && (
        <Reveal>
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-primary via-secondary to-accent shadow-xl">
            <div className="rounded-[calc(1.5rem-2px)] bg-base-100 p-7 md:p-9 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" strokeWidth={1.8} />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-extrabold mb-1">
                {t('plan.unlockTitle')} — {money(planPrice)}
              </h2>
              <p className="text-base-content/60 mb-5">{t('plan.unlockDesc')}</p>
              {actionError && <div className="alert alert-error text-sm py-2 mb-3">{actionError}</div>}
              {isOwner ? (
                pendingVerification ? (
                  <div className="alert alert-info justify-center">
                    <Hourglass className="w-5 h-5" /> {t('bkash.pending')}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {freeCredits > 0 && (
                        <button onClick={handleUnlock} className="btn btn-secondary rounded-full gap-2" disabled={unlock.isPending}>
                          <Gift className="w-4 h-4" /> {t('plan.freeCreditBtn')} ({t('plan.freeCreditsLeft')}: {Number(freeCredits).toLocaleString('bn-BD')})
                        </button>
                      )}
                      {paymentOptions?.online && (
                        <button onClick={handlePay} className="btn btn-primary rounded-full gap-2" disabled={initPay.isPending}>
                          <CreditCard className="w-4 h-4" /> {t('plan.payBtn')} ({money(planPrice)})
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
        </Reveal>
      )}

      {/* Full content */}
      {!locked && (
        <>
          {o.costBreakdown?.length > 0 && (
            <SectionCard icon={ReceiptText} title={t('plan.costBreakdown')}>
              <table className="table">
                <tbody>
                  {o.costBreakdown.map((c, i) => (
                    <tr key={i}>
                      <td>{c.item}</td>
                      <td className="text-right">{money(c.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-primary">
                    <td>{t('plan.total')}</td>
                    <td className="text-right">{money(o.totalCostEstimate)}</td>
                  </tr>
                </tbody>
              </table>
            </SectionCard>
          )}

          {o.hiddenPlaces?.length > 0 && (
            <SectionCard icon={Gem} title={t('plan.hiddenPlaces')}>
              <ul className="space-y-1.5">
                {o.hiddenPlaces.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <Gem className="w-4 h-4 text-secondary shrink-0 mt-1" /> {h}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {o.warnings?.length > 0 && (
            <Reveal>
              <div className="rounded-2xl border border-warning/40 bg-warning/10 p-6">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-warning" /> {t('district.warnings')}
                </h3>
                <ul className="space-y-2">
                  {o.warnings.map((w, i) => (
                    <li key={i} className="flex gap-2.5 text-base-content/80">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-warning shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {o.tips?.length > 0 && (
            <SectionCard icon={Lightbulb} title={t('plan.tips')}>
              <ul className="space-y-1.5">
                {o.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-1" /> {tip}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {isOwner && (
            <Reveal className="text-center">
              {actionError && <div className="alert alert-error text-sm py-2 mb-3">{actionError}</div>}
              <button onClick={handleDownload} className="btn btn-primary btn-lg rounded-full px-10 gap-2 shadow-xl shadow-primary/25" disabled={downloading}>
                {downloading ? <span className="loading loading-spinner loading-sm"></span> : <Download className="w-5 h-5" />}
                {t('plan.downloadPdf')}
              </button>
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}
