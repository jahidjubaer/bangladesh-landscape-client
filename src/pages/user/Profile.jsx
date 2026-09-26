import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    [t('profile.name'), user.name],
    [t('profile.phone'), user.phone],
    [t('profile.email'), user.email || '—'],
    [t('profile.roles'), user.roles.join(', ')],
    [t('profile.freeCredits'), user.freePlanCredits],
    [t('profile.memberSince'), new Date(user.createdAt).toLocaleDateString('bn-BD')],
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary via-secondary to-primary/70" />
        <div className="card-body pt-0">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="avatar placeholder">
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl w-20 text-3xl ring-4 ring-base-100 shadow-lg">
                <span>{user.name.charAt(0)}</span>
              </div>
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
    </div>
  );
}
