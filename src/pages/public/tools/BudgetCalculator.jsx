import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Users, Sun, Bus, BedDouble, UtensilsCrossed, Ticket, Sparkles, ArrowRight } from 'lucide-react';
import Seo from '../../../components/Seo';
import { useDistricts } from '../../../features/districts/queries';
import api from '../../../lib/api';
import { t, lx, locale } from '../../../i18n';

// Per person per day (BDT, 2026 desk estimates). Rooms assume 2 people sharing.
const LEVELS = {
  budget: { room: 900, food: 450, local: 250 },
  standard: { room: 2200, food: 800, local: 450 },
  comfort: { room: 5500, food: 1500, local: 900 },
};
const money = (n) => `${Math.round(n).toLocaleString(locale())} ৳`;

export default function BudgetCalculator() {
  const { data: districts } = useDistricts();
  const [from, setFrom] = useState('dhaka');
  const [to, setTo] = useState('coxs-bazar');
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(3);
  const [level, setLevel] = useState('standard');
  const [mode, setMode] = useState('');

  const { data: route } = useQuery({
    queryKey: ['tools-route', from, to],
    queryFn: async () => (await api.get('/tools/route', { params: { from, to } })).data.data,
    enabled: Boolean(from && to),
  });

  const options = route?.options || [];
  const chosen = options.find((o) => o.mode === mode) || options.find((o) => o.mode === 'train') || options[0];
  const n = Math.max(1, Number(people) || 1);
  const d = Math.max(1, Number(days) || 1);
  const nights = Math.max(0, d - 1);
  const L = LEVELS[level];
  // Fare range midpoint by comfort level: budget → cheapest, comfort → top
  const farePick = chosen ? chosen.fare.min + (chosen.fare.max - chosen.fare.min) * { budget: 0, standard: 0.4, comfort: 1 }[level] : 0;

  const rows = [
    { Icon: Bus, label: t('tools.budget.transport'), value: farePick * 2 * n, hint: chosen ? `${lx(chosen.label)} × 2` : '' },
    { Icon: BedDouble, label: t('tools.budget.stay'), value: L.room * Math.ceil(n / 2) * nights, hint: `${num(nights)} ${t('tools.budget.nights')}` },
    { Icon: UtensilsCrossed, label: t('tools.budget.food'), value: L.food * n * d },
    { Icon: Ticket, label: t('tools.budget.local'), value: L.local * n * d },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0) * 1.1; // +10% buffer
  const sorted = [...(districts || [])].sort((a, b) => lx(a.name).localeCompare(lx(b.name)));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Seo title={t('tools.budget.name')} description={t('tools.budget.desc')} />
      <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2 mb-2">
        <Calculator className="w-7 h-7 text-primary" /> {t('tools.budget.name')}
      </h1>
      <p className="text-base-content/60 mb-8">{t('tools.budget.desc')}</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [t('plan.startFrom'), from, setFrom],
                [t('plan.destination'), to, setTo],
              ].map(([label, value, set]) => (
                <label key={label} className="form-control">
                  <span className="label-text font-semibold mb-1">{label}</span>
                  <select className="select select-bordered" value={value} onChange={(e) => { set(e.target.value); setMode(''); }}>
                    {sorted.map((x) => <option key={x.slug} value={x.slug}>{lx(x.name)}</option>)}
                  </select>
                </label>
              ))}
              <label className="form-control">
                <span className="label-text font-semibold mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {t('plan.members')}</span>
                <input type="number" min="1" max="50" className="input input-bordered" value={people} onChange={(e) => setPeople(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1 flex items-center gap-2"><Sun className="w-4 h-4 text-primary" /> {t('plan.days')}</span>
                <input type="number" min="1" max="15" className="input input-bordered" value={days} onChange={(e) => setDays(e.target.value)} />
              </label>
            </div>

            <div>
              <span className="label-text font-semibold block mb-2">{t('tools.budget.level')}</span>
              <div className="join w-full">
                {Object.keys(LEVELS).map((k) => (
                  <button key={k} className={`btn join-item flex-1 ${level === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLevel(k)}>
                    {t(`tools.budget.levels.${k}`)}
                  </button>
                ))}
              </div>
            </div>

            {options.length > 0 && (
              <div>
                <span className="label-text font-semibold block mb-2">{t('plan.travelOptions')}</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map((o) => (
                    <button
                      key={o.mode}
                      onClick={() => setMode(o.mode)}
                      className={`rounded-xl border-2 p-3 text-left transition-colors ${chosen?.mode === o.mode ? 'border-primary bg-primary/5' : 'border-base-200 hover:border-primary/40'}`}
                    >
                      <div className="font-bold">{lx(o.label)}</div>
                      <div className="text-xs text-base-content/60">
                        ~{num(o.km)} km · ~{num(o.hours)} {t('spot.hours')} · {money(o.fare.min)}–{money(o.fare.max)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {route && !options.length && <p className="text-sm text-base-content/60">{t('tools.budget.sameDistrict')}</p>}
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg lg:sticky lg:top-24">
          <div className="card-body gap-3">
            {rows.map(({ Icon, label, value, hint }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px]" /></span>
                <div className="grow">
                  <div className="text-sm">{label}</div>
                  {hint && <div className="text-xs text-base-content/50">{hint}</div>}
                </div>
                <div className="font-semibold">{money(value)}</div>
              </div>
            ))}
            <div className="divider my-1" />
            <div className="flex justify-between items-end">
              <span className="font-semibold">{t('tools.budget.total')}</span>
              <span className="text-3xl font-extrabold text-primary">{money(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-base-content/60">
              <span>{t('plan.perPerson')}</span>
              <span>{money(total / n)}</span>
            </div>
            <p className="text-xs text-base-content/50">{t('tools.budget.note')}</p>
            <Link to="/plan" className="btn btn-primary rounded-full mt-2">
              <Sparkles className="w-4 h-4" /> {t('tools.budget.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function num(n) {
  return Number(n).toLocaleString(locale());
}
