import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDistricts, useAdminSpots, useDeleteSpot } from '../../features/districts/queries';
import Loader from '../../components/Loader';
import { useConfirm } from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { t } from '../../i18n';

export default function AdminSpots() {
  const [districtFilter, setDistrictFilter] = useState('');
  const { data: districts } = useAdminDistricts();
  const { data: spots, isLoading } = useAdminSpots(districtFilter || undefined);
  const del = useDeleteSpot();
  const confirm = useConfirm();
  const toast = useToast();

  async function handleDelete(s) {
    if (!(await confirm(`${t('admin.confirmDelete')} (${s.name.bn})`))) return;
    try {
      await del.mutateAsync(s._id);
      toast('মুছে ফেলা হয়েছে', 'success');
    } catch (err) {
      toast(err.response?.data?.message || t('common.error'), 'error');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t('admin.spots')}</h1>
        <div className="flex gap-3">
          <select className="select select-bordered select-sm" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">সব জেলা</option>
            {(districts || []).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name.bn}
              </option>
            ))}
          </select>
          <Link to="/admin/spots/new" className="btn btn-primary btn-sm">
            + {t('admin.addSpot')}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
          <table className="table">
            <thead>
              <tr>
                <th>নাম</th>
                <th>জেলা</th>
                <th>ক্যাটাগরি</th>
                <th>স্ট্যাটাস</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {spots.map((s) => (
                <tr key={s._id}>
                  <td className="font-semibold">{s.name.bn}</td>
                  <td>{s.district?.name?.bn}</td>
                  <td>
                    <span className="badge badge-outline badge-sm">{t(`spot.category.${s.category}`)}</span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${s.isActive ? 'badge-success' : 'badge-ghost'}`}>
                      {s.isActive ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </td>
                  <td className="text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/spots/${s._id}`} className="btn btn-xs btn-outline">
                      {t('admin.edit')}
                    </Link>
                    <button onClick={() => handleDelete(s)} className="btn btn-xs btn-error btn-outline" disabled={del.isPending}>
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
