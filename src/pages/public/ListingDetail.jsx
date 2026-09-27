import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recordView } from '../../lib/recent';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { ArrowLeft, Users, Phone, BedDouble, CalendarDays, Wallet, Info } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Img from '../../components/ui/Img';
import Reveal from '../../components/ui/Reveal';
import StarRating from '../../components/ui/StarRating';
import Reviews from '../../components/Reviews';
import Seo from '../../components/Seo';
import NotFound from '../NotFound';
import { t, lx, locale } from '../../i18n';

const DAY_MS = 24 * 60 * 60 * 1000;
const money = (n) => `৳${Number(n || 0).toLocaleString(locale())}`;

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState({ from: '', to: '', members: 2, note: '' });
  const [message, setMessage] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => (await api.get(`/listings/${id}`)).data.data, // { listing, bookable }
    enabled: Boolean(id),
  });

  const book = useMutation({
    mutationFn: async (payload) => (await api.post('/bookings/listing', payload)).data,
  });

  useEffect(() => {
    const l = data?.listing;
    if (l) recordView({ kind: 'listing', link: `/listings/${l._id}`, title: l.name, image: l.images?.[0] });
  }, [data]);

  if (isLoading) return <Loader fullScreen />;
  if (isError || !data) return <NotFound />;

  const { listing, bookable } = data;
  const days =
    form.from && form.to && new Date(form.to) >= new Date(form.from)
      ? Math.round((new Date(form.to) - new Date(form.from)) / DAY_MS) + 1
      : 0;
  const estimate = days * (listing.priceRange?.min || 0);

  async function handleBook(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await book.mutateAsync({ listingId: id, ...form, members: Number(form.members) });
      setMessage({ type: 'success', text: t('listing.requested') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Seo title={lx(listing.name)} description={lx(listing.description)} image={listing.images?.[0]} />

      <Reveal>
        <Link to={`/districts/${listing.district.slug}`} className="inline-flex items-center gap-1.5 text-sm link link-primary mb-3">
          <ArrowLeft className="w-4 h-4" /> {lx(listing.district.name)} — {t('listing.backToDistrict')}
        </Link>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold flex items-center gap-3 flex-wrap mb-6">
          {lx(listing.name)}
          <span className="badge badge-primary badge-outline">{t(`listingType.${listing.type}`)}</span>
          {listing.ratingCount > 0 && <StarRating value={listing.ratingAvg} count={listing.ratingCount} size={18} />}
        </h1>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        <div className="space-y-8 min-w-0">
          <Reveal>
            {listing.images?.length > 0 ? (
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                spaceBetween={12}
                className="rounded-2xl overflow-hidden shadow-lg [--swiper-theme-color:var(--color-primary)]"
              >
                {listing.images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <Img src={img} alt={`${lx(listing.name)} ${i + 1}`} className="w-full h-72 md:h-96 object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Img alt={lx(listing.name)} icon={BedDouble} className="w-full h-72 rounded-2xl" />
            )}
          </Reveal>

          {lx(listing.description) && (
            <Reveal>
              <p className="text-lg leading-relaxed text-base-content/85">{lx(listing.description)}</p>
            </Reveal>
          )}

          {/* Reviews */}
          <Reveal>
            <Reviews kind="listing" itemId={listing._id} ratingAvg={listing.ratingAvg} ratingCount={listing.ratingCount} />
          </Reveal>
        </div>

        {/* Booking / contact box */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Reveal delay={0.1}>
            <div className="card bg-base-100 shadow-xl border border-primary/30">
              <div className="card-body">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-primary">
                    {money(listing.priceRange?.min)}–{money(listing.priceRange?.max)}
                  </span>
                </div>
                {listing.capacity > 0 && (
                  <div className="text-sm text-base-content/65 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {t('listing.capacity')}: {Number(listing.capacity).toLocaleString(locale())}
                  </div>
                )}

                {message && <div className={`alert alert-${message.type} text-sm py-2`}>{message.text}</div>}

                {bookable ? (
                  !user ? (
                    <Link to="/login" state={{ from: `/listings/${id}` }} className="btn btn-primary rounded-full mt-2">
                      {t('booking.loginToBook')}
                    </Link>
                  ) : message?.type === 'success' ? null : (
                    <form onSubmit={handleBook} className="space-y-3 mt-2">
                      <label className="form-control">
                        <span className="label-text mb-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-primary" /> {t('booking.from')}</span>
                        <input type="date" required className="input input-bordered input-sm" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-primary" /> {t('booking.to')}</span>
                        <input type="date" required className="input input-bordered input-sm" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {t('booking.members')}</span>
                        <input type="number" min="1" className="input input-bordered input-sm" value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} />
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1">{t('booking.note')}</span>
                        <textarea rows={2} className="textarea textarea-bordered textarea-sm" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                      </label>
                      {days > 0 && (
                        <div className="alert py-2 text-sm">
                          <Wallet className="w-4 h-4" />
                          <span>
                            {t('listing.estimated')}: <strong>{money(estimate)}</strong> ({Number(days).toLocaleString(locale())} {t('plan.day')})
                            <br />
                            <span className="text-xs opacity-70">{t('listing.estimateNote')}</span>
                          </span>
                        </div>
                      )}
                      <button type="submit" className="btn btn-primary w-full rounded-full" disabled={book.isPending}>
                        {book.isPending ? t('booking.requesting') : t('listing.bookNow')}
                      </button>
                      <p className="text-xs text-base-content/50 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> {t('listing.contactAfter')}
                      </p>
                    </form>
                  )
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-base-content/65">{t('listing.notBookable')}</p>
                    {listing.contactPhone && (
                      <a href={`tel:${listing.contactPhone}`} className="btn btn-outline rounded-full gap-2 w-full">
                        <Phone className="w-4 h-4" /> {listing.contactPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
