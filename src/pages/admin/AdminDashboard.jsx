import { useAdminDistricts, useAdminSpots } from '../../features/districts/queries';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: districts } = useAdminDistricts();
  const { data: spots } = useAdminSpots();

  const stats = [
    { title: t('admin.totalDistricts'), value: districts?.length ?? '…' },
    { title: t('admin.launchedDistricts'), value: districts?.filter((d) => d.isLaunched).length ?? '…' },
    { title: t('admin.totalSpots'), value: spots?.length ?? '…' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t('admin.welcome')}, {user?.name} 👋
      </h1>
      <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
        {stats.map((s) => (
          <div key={s.title} className="stat">
            <div className="stat-title">{s.title}</div>
            <div className="stat-value text-primary">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
