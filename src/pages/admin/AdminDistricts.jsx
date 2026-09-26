import { Link } from 'react-router-dom';
import { useAdminDistricts, useDeleteDistrict } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { t } from '../../i18n';

export default function AdminDistricts() {
  const { data: districts, isLoading } = useAdminDistricts();
  const del = useDeleteDistrict();
  const confirm = useConfirm();
  const toast = useToast();

  if (isLoading) return <Loader />;

  async function handleDelete(d) {
    if (!(await confirm(`${t('admin.confirmDelete')} (${d.name.bn})`))) return;
    try {
      await del.mutateAsync(d._id);
      toast('মুছে ফেলা হয়েছে', 'success');
    } catch (err) {
      toast(err.response?.data?.message || t('common.error'), 'error');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">{t('admin.districts')}</h1>
        <Link to="/admin/districts/new" className="btn btn-primary btn-sm">
          + {t('admin.addDistrict')}
        </Link>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>নাম</th>
              <th>Slug</th>
              <th>স্ট্যাটাস</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d._id}>
                <td className="font-semibold">{d.name.bn}</td>
                <td className="text-base-content/60">{d.slug}</td>
                <td>
                  <span className={`badge ${d.isLaunched ? 'badge-success' : 'badge-ghost'}`}>
                    {d.isLaunched ? t('admin.launched') : t('admin.notLaunched')}
                  </span>
                </td>
                <td className="text-right space-x-2 whitespace-nowrap">
                  <Link to={`/admin/districts/${d._id}`} className="btn btn-xs btn-outline">
                    {t('admin.edit')}
                  </Link>
                  <button onClick={() => handleDelete(d)} className="btn btn-xs btn-error btn-outline" disabled={del.isPending}>
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
