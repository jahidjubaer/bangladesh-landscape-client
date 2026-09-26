import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAdminDistricts, useAdminSpot, useSaveSpot } from '../../features/districts/queries';
import ImageUploader from '../../components/ImageUploader';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const CATEGORIES = ['haor', 'hill', 'river', 'waterfall', 'garden', 'heritage', 'other'];
const TAGS = ['adventure', 'family', 'relaxed'];

const emptyValues = {
  district: '',
  slug: '',
  category: 'other',
  isHidden: false,
  isActive: true,
  name: { bn: '', en: '' },
  description: { bn: '' },
  howToGo: { bn: '' },
  bestTime: { bn: '' },
  entryCost: { min: 0, max: 0 },
  timeNeededHours: 1,
  location: { lat: '', lng: '' },
  imagesText: '',
  warningsText: '',
  obstaclesText: '',
  tags: [],
};

const lines = (text) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

function toFormValues(s) {
  return {
    ...emptyValues,
    ...s,
    district: s.district?._id || s.district,
    imagesText: (s.images || []).join('\n'),
    warningsText: (s.warnings || []).map((w) => w.bn).join('\n'),
    obstaclesText: (s.obstacles || []).map((o) => o.bn).join('\n'),
    location: { lat: s.location?.lat ?? '', lng: s.location?.lng ?? '' },
  };
}

function toPayload(values) {
  const { imagesText, warningsText, obstaclesText, _id, __v, createdAt, updatedAt, ...rest } = values;
  return {
    ...rest,
    entryCost: { min: Number(values.entryCost.min) || 0, max: Number(values.entryCost.max) || 0 },
    timeNeededHours: Number(values.timeNeededHours) || 0,
    location: {
      lat: values.location.lat === '' ? null : Number(values.location.lat),
      lng: values.location.lng === '' ? null : Number(values.location.lng),
    },
    images: lines(imagesText),
    warnings: lines(warningsText).map((bn) => ({ bn, en: '' })),
    obstacles: lines(obstaclesText).map((bn) => ({ bn, en: '' })),
  };
}

export default function AdminSpotForm() {
  const { id } = useParams();
  const isEdit = id !== 'new';
  const navigate = useNavigate();
  const { data: districts } = useAdminDistricts();
  const { data: spot, isLoading } = useAdminSpot(isEdit ? id : null);
  const save = useSaveSpot();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, getValues, setValue, formState: { isSubmitting } } = useForm({ defaultValues: emptyValues });

  useEffect(() => {
    if (spot) reset(toFormValues(spot));
  }, [spot, reset]);

  if (isEdit && isLoading) return <Loader />;

  async function onSubmit(values) {
    setServerError('');
    try {
      await save.mutateAsync({ id: isEdit ? id : undefined, payload: toPayload(values) });
      navigate('/admin/spots');
    } catch (err) {
      setServerError(err.response?.data?.message || t('common.error'));
    }
  }

  function appendImage(url) {
    const current = getValues('imagesText');
    setValue('imagesText', current ? `${current}\n${url}` : url, { shouldDirty: true });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? `${t('admin.edit')}: ${spot?.name?.bn || ''}` : t('admin.addSpot')}</h1>
      {serverError && <div className="alert alert-error mb-4">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-base-100 rounded-xl shadow-md p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">জেলা *</span>
            <select className="select select-bordered" {...register('district', { required: true })}>
              <option value="">নির্বাচন করুন</option>
              {(districts || []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name.bn}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">ক্যাটাগরি</span>
            <select className="select select-bordered" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`spot.category.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">নাম (বাংলা) *</span>
            <input className="input input-bordered" {...register('name.bn', { required: true })} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Name (English)</span>
            <input className="input input-bordered" {...register('name.en')} />
          </label>
          <label className="form-control md:col-span-2">
            <span className="label-text mb-1 font-semibold">Slug (URL) *</span>
            <input className="input input-bordered" placeholder="tanguar-haor" {...register('slug', { required: true, pattern: /^[a-z0-9-]+$/ })} />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text mb-1 font-semibold">বর্ণনা (বাংলা)</span>
          <textarea rows={4} className="textarea textarea-bordered" {...register('description.bn')} />
        </label>
        <label className="form-control">
          <span className="label-text mb-1 font-semibold">কীভাবে যাবেন (বাংলা)</span>
          <textarea rows={3} className="textarea textarea-bordered" {...register('howToGo.bn')} />
        </label>

        <div className="form-control">
          <span className="label-text mb-1 font-semibold">ছবি (প্রতি লাইনে একটি URL)</span>
          <textarea rows={3} className="textarea textarea-bordered" {...register('imagesText')} />
          <div className="mt-2">
            <ImageUploader onUploaded={appendImage} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">প্রবেশ ফি (min)</span>
            <input type="number" className="input input-bordered" {...register('entryCost.min')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">প্রবেশ ফি (max)</span>
            <input type="number" className="input input-bordered" {...register('entryCost.max')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">সময় লাগবে (ঘণ্টা)</span>
            <input type="number" step="0.5" className="input input-bordered" {...register('timeNeededHours')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Lat</span>
            <input type="number" step="any" className="input input-bordered" {...register('location.lat')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">Lng</span>
            <input type="number" step="any" className="input input-bordered" {...register('location.lng')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 font-semibold">{t('spot.bestTime')} (বাংলা)</span>
            <input className="input input-bordered" {...register('bestTime.bn')} />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text mb-1 font-semibold">সতর্কতা (প্রতি লাইনে একটি)</span>
          <textarea rows={2} className="textarea textarea-bordered" {...register('warningsText')} />
        </label>
        <label className="form-control">
          <span className="label-text mb-1 font-semibold">প্রতিবন্ধকতা (প্রতি লাইনে একটি)</span>
          <textarea rows={2} className="textarea textarea-bordered" {...register('obstaclesText')} />
        </label>

        <div className="flex flex-wrap gap-6">
          <div>
            <span className="label-text font-semibold block mb-2">ট্যাগ</span>
            <div className="flex gap-4">
              {TAGS.map((tag) => (
                <label key={tag} className="label cursor-pointer gap-2">
                  <input type="checkbox" value={tag} className="checkbox checkbox-sm" {...register('tags')} />
                  <span className="label-text">{t(`spot.tag.${tag}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="label cursor-pointer gap-2">
            <input type="checkbox" className="toggle toggle-sm" {...register('isHidden')} />
            <span className="label-text font-semibold">{t('district.hiddenGem')}</span>
          </label>
          <label className="label cursor-pointer gap-2">
            <input type="checkbox" className="toggle toggle-success toggle-sm" {...register('isActive')} />
            <span className="label-text font-semibold">{t('admin.active')}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('admin.saving') : t('admin.save')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/spots')}>
            {t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
