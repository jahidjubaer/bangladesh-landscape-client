import { useState } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Reveal from '../../components/ui/Reveal';
import { t, locale } from '../../i18n';

function ReferralCard({ user }) {
  const [copied, setCopied] = useState(false);
  if (!user.referralCode) return null;

  const link = `${window.location.origin}/register?ref=${user.referralCode}`;

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Reveal delay={0.08}>
      <div className="card bg-gradient-to-br from-accent/10 via-base-100 to-primary/10 border border-accent/30 shadow-md">
        <div className="card-body">
          <h2 className="card-title gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Gift className="w-5 h-5" strokeWidth={1.8} />
            </span>
            {t('referral.title')}
          </h2>
          <p className="text-base-content/70 text-sm">{t('referral.desc')}</p>

          <div className="mt-2">
            <span className="label-text text-xs text-base-content/50">{t('referral.yourLink')}</span>
            <div className="flex gap-2 mt-1">
              <input readOnly className="input input-bordered input-sm flex-1 font-mono text-xs" value={link} onFocus={(e) => e.target.select()} />
              <button onClick={copy} className={`btn btn-sm gap-1.5 ${copied ? 'btn-success' : 'btn-accent'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('referral.copied') : t('referral.copy')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2 text-base-content/65">
            <Users className="w-4 h-4 text-accent" />
            {t('referral.earned')}: <strong>{Number(user.referralCount || 0).toLocaleString(locale())}</strong>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    [t('profile.name'), user.name],
    [t('profile.phone'), user.phone],
    [t('profile.email'), user.email || '—'],
    [t('profile.roles'), user.roles.join(', ')],
    [t('profile.freeCredits'), Number(user.freePlanCredits).toLocaleString(locale())],
    [t('profile.memberSince'), new Date(user.createdAt).toLocaleDateString(locale())],
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <Reveal>
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary via-secondary to-primary/70" />
          <div className="card-body pt-0">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="avatar placeholder">
                {user.avatarUrl ? (
                  <div className="w-20 rounded-2xl ring-4 ring-base-100 shadow-lg">
                    <img src={user.avatarUrl} alt={user.name} />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl w-20 text-3xl ring-4 ring-base-100 shadow-lg">
                    <span>{user.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-extrabold">{user.name}</h1>
                <div className="flex gap-1 flex-wrap">
                  {user.roles.map((r) => (
                    <span key={r} className="badge badge-primary badge-outline badge-sm">{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <table className="table">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th className="w-40">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <ReferralCard user={user} />
    </div>
  );
}
