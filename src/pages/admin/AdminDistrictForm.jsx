import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAdminDistrict, useSaveDistrict } from '../../features/districts/queries';
import ImageUploader from '../../components/ImageUploader';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const STAY_TYPES = ['houseboat', 'cottage', 'hotel', 'resort'];
const FEATURES = ['guideBooking', 'boatBooking', 'hotelBooking', 'transportBooking'];

const emptyValues = {
  slug: '',
  division: '',
  isLaunched: false,
  heroImageUrl: '',
  name: { bn: '', en: '' },
  overview: { bn: '' },
  transportInfo: { bn: '' },
  foodInfo: { bn: '' },
  bestSeason: { bn: '' },
  emergency: { police: '', hospital: '', fireService: '' },
  mapCenter: { lat: 23.685, lng: 90.3563 },
  zoom: 10,
  warningsText: '',
  stayTypesAvailable: [],
  features: { guideBooking: false, boatBooking: false, hotelBooking: false, transportBooking: false },
};

function toFormValues(d) {
  return {
    ...emptyValues,
    ...d,
    warningsText: (d.warnings || []).map((w) => w.bn).join('\n'),
  };
}

function toPayload(values) {
  const { warningsText, _id, __v, createdAt, updatedAt, ...rest } = values;
  return {
    ...rest,
    mapCenter: { lat: Number(values.mapCenter.lat), lng: Number(values.mapCenter.lng) },
    zoom: Number(values.zoom),
    warnings: warningsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((bn) => ({ bn, en: '' })),
  };
}

export default function AdminDistrictForm() {
  const { id } = useParams();
  const isEdit = id !== 'new';
  const navigate = useNavigate();
  const { data: district, isLoading } = useAdminDistrict(isEdit ? id : null);
  const save = useSaveDistrict();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm({ defaultValues: emptyValues });
  const heroImageUrl = watch('heroImageUrl');

  useEffect(() => {
    if (district) reset(toFormValues(district));
  }, [district, reset]);

  if (isEdit && isLoading) return <Loader />;

  async function onSubmit(values) {
    setServerError('');
    try {
      await save.mutateAsync({ id: isEdit ? id : undefined, payload: toPayload(values) });
      navigate('/admin/districts');
    } catch (err) {
      setServerError(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? `${t('admin.edit')}: ${district?.name?.bn || ''}` : t('admin.addDistrict')}</h1>
      {serverError && <div className="alert alert-error mb-4">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-base-100 rounded-xl shadow-md p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">নাম (বাংলা) *</span>
            <input className="input input-bordered" {...register('name.bn', { required: true })} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Name (English)</span>
            <input className="input input-bordered" {...register('name.en')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Slug (URL) *</span>
            <input className="input input-bordered" placeholder="sunamganj" {...register('slug', { required: true, pattern: /^[a-z0-9-]+$/ })} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">বিভাগ</span>
            <input className="input input-bordered" placeholder="Sylhet" {...register('division')} />
          </label>
        </div>

        <div className="form-control">
          <span className="label-text mb-1 font-semibold">হিরো ইমেজ</span>
          <div className="flex flex-wrap items-center gap-3">
            <input className="input input-bordered flex-1 min-w-60" placeholder="/uploads/... বা https://..." {...register('heroImageUrl')} />
            <ImageUploader onUploaded={(url) => setValue('heroImageUrl', url, { shouldDirty: true })} />
          </div>
          {heroImageUrl && <img src={heroImageUrl} alt="hero preview" className="mt-3 h-32 rounded-lg object-cover" />}
        </div>

        {[
          ['overview.bn', 'পরিচিতি (বাংলা)', 4],
          ['transportInfo.bn', 'যাতায়াত তথ্য (বাংলা)', 4],
          ['foodInfo.bn', 'খাবার তথ্য (বাংলা)', 3],
          ['bestSeason.bn', 'সেরা সময় (বাংলা)', 2],
        ].map(([field, label, rows]) => (
          <label key={field} className="form-control">
            <span className="label-text mb-1 font-semibold">{label}</span>
            <textarea rows={rows} className="textarea textarea-bordered" {...register(field)} />
          </label>
        ))}

        {/* English content (optional — shown to foreign tourists) */}
        <div className="collapse collapse-arrow bg-base-200 rounded-xl">
          <input type="checkbox" />
          <div className="collapse-title font-semibold">🌐 English content (optional)</div>
          <div className="collapse-content space-y-3">
            {[
              ['overview.en', 'Overview (English)', 4],
              ['transportInfo.en', 'Transport info (English)', 4],
              ['foodInfo.en', 'Food info (English)', 3],
              ['bestSeason.en', 'Best season (English)', 2],
            ].map(([field, label, rows]) => (
              <label key={field} className="form-control">
                <span className="label-text mb-1 font-semibold">{label}</span>
                <textarea rows={rows} className="textarea textarea-bordered" {...register(field)} />
              </label>
            ))}
          </div>
        </div>

        <label className="form-control">
          <span className="label-text mb-1 font-semibold">সতর্কতা (প্রতি লাইনে একটি)</span>
          <textarea rows={4} className="textarea textarea-bordered" {...register('warningsText')} />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">{t('district.police')}</span>
            <input className="input input-bordered" {...register('emergency.police')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">{t('district.hospital')}</span>
            <input className="input input-bordered" {...register('emergency.hospital')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">{t('district.fireService')}</span>
            <input className="input input-bordered" {...register('emergency.fireService')} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">ম্যাপ কেন্দ্র Lat</span>
            <input type="number" step="any" className="input input-bordered" {...register('mapCenter.lat')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">ম্যাপ কেন্দ্র Lng</span>
            <input type="number" step="any" className="input input-bordered" {...register('mapCenter.lng')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Zoom</span>
            <input type="number" className="input input-bordered" {...register('zoom')} />
          </label>
        </div>

        <div>
          <span className="label-text font-semibold block mb-2">থাকার ব্যবস্থা</span>
          <div className="flex flex-wrap gap-4">
            {STAY_TYPES.map((st) => (
              <label key={st} className="label cursor-pointer gap-2">
                <input type="checkbox" value={st} className="checkbox checkbox-sm" {...register('stayTypesAvailable')} />
                <span className="label-text">{st}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="label-text font-semibold block mb-2">ফিচার ফ্ল্যাগ</span>
          <div className="flex flex-wrap gap-4">
            {FEATURES.map((f) => (
              <label key={f} className="label cursor-pointer gap-2">
                <input type="checkbox" className="toggle toggle-sm" {...register(`features.${f}`)} />
                <span className="label-text">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="label cursor-pointer justify-start gap-3">
          <input type="checkbox" className="toggle toggle-success" {...register('isLaunched')} />
          <span className="label-text font-semibold">{t('admin.launched')} (পাবলিক সাইটে দেখা যাবে)</span>
        </label>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('admin.saving') : t('admin.save')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/districts')}>
            {t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
