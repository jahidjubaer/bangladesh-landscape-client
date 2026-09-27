import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquareText, Hourglass } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';
import StarRating from './ui/StarRating';
import { t, locale } from '../i18n';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n}/5`}
          className="cursor-pointer p-0.5"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              (hover || value) >= n ? 'text-warning fill-warning' : 'text-base-content/25'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Moderated reviews block for spots and stays. Shows the live average,
// the caller's own review (editable, re-moderated) and approved reviews.
export default function Reviews({ kind, itemId, ratingAvg = 0, ratingCount = 0 }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const { data } = useQuery({
    queryKey: ['reviews', kind, itemId],
    queryFn: async () => (await api.get('/reviews', { params: { kind, itemId } })).data.data,
    enabled: Boolean(itemId),
  });

  const mine = data?.mine;
  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setText(mine.text || '');
    }
  }, [mine]);

  const submit = useMutation({
    mutationFn: async () => (await api.post('/reviews', { kind, itemId, rating, text })).data,
    onSuccess: () => {
      toast(t('review.submitted'), 'success');
      qc.invalidateQueries({ queryKey: ['reviews', kind, itemId] });
    },
    onError: (err) => toast(err.response?.data?.message || t('common.error'), 'error'),
  });

  const reviews = data?.reviews || [];

  return (
    <section className="card bg-base-100 shadow-md">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-title gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" /> {t('review.title')}
          </h2>
          {ratingCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-extrabold">{ratingAvg}</span>
              <div>
                <StarRating value={ratingAvg} size={16} />
                <div className="text-xs text-base-content/50">
                  {t('review.count').replace('{n}', Number(ratingCount).toLocaleString(locale()))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Write / edit own review */}
        {!user ? (
          <Link to="/login" className="link link-primary text-sm w-fit">
            {t('review.loginPrompt')}
          </Link>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (rating >= 1) submit.mutate();
            }}
            className="rounded-2xl bg-base-200 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-sm">{t('review.yourRating')}:</span>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <textarea
              rows={2}
              maxLength={2000}
              className="textarea textarea-bordered w-full"
              placeholder={t('review.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {mine?.status === 'pending' && (
              <div className="text-xs text-warning-content/80 flex items-center gap-1.5 bg-warning/15 rounded-lg px-3 py-2 w-fit">
                <Hourglass className="w-3.5 h-3.5" /> {t('review.pendingNote')}
              </div>
            )}
            {mine?.status === 'rejected' && <div className="text-xs text-error">{t('review.rejectedNote')}</div>}
            <button type="submit" className="btn btn-primary btn-sm rounded-full px-6" disabled={rating < 1 || submit.isPending}>
              {submit.isPending && <span className="loading loading-spinner loading-xs" />}
              {mine ? t('review.update') : t('review.submit')}
            </button>
          </form>
        )}

        {/* Approved reviews */}
        {!reviews.length ? (
          <p className="text-base-content/55 text-sm">{t('review.empty')}</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-2xl bg-base-200 p-4">
                <div className="flex justify-between items-center mb-1">
                  <strong className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                      {r.user?.name?.charAt(0)}
                    </span>
                    {r.user?.name}
                  </strong>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.text && <p className="text-sm text-base-content/75 leading-relaxed">{r.text}</p>}
                <span className="text-xs text-base-content/45">{new Date(r.createdAt).toLocaleDateString(locale())}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
