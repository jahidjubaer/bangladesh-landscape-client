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
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16 text-2xl">
                <span>{user.name.charAt(0)}</span>
              </div>
            </div>
            <h1 className="card-title text-2xl">{t('profile.title')}</h1>
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
