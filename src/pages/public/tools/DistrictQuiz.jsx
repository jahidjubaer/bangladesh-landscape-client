import { useState, useMemo } from 'react';
import { Link } from '../../../lib/router';
import { m as motion } from 'motion/react';
import { Brain, Check, X, RotateCcw, Share2, Trophy } from 'lucide-react';
import Seo from '../../../components/Seo';
import { useToast } from '../../../components/ui/Toast';
import { DISTRICTS, MAP_WIDTH, MAP_HEIGHT } from '../../../features/districtMap/bdDistricts';
import { t, getLang, locale } from '../../../i18n';

const ROUNDS = 10;
const nameOf = (d) => (getLang() === 'en' ? d.en : d.bn);
const num = (n) => Number(n).toLocaleString(locale());

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Distractors come from the same division half the time — harder, more fun
function makeRound(answer) {
  const sameDiv = shuffle(DISTRICTS.filter((d) => d.division === answer.division && d.slug !== answer.slug));
  const others = shuffle(DISTRICTS.filter((d) => d.division !== answer.division));
  const wrong = [...sameDiv.slice(0, 2), ...others].slice(0, 3);
  return { answer, choices: shuffle([answer, ...wrong]) };
}

function newGame() {
  return shuffle(DISTRICTS).slice(0, ROUNDS).map(makeRound);
}

function verdict(score) {
  if (score >= 9) return t('tools.quiz.rank4');
  if (score >= 7) return t('tools.quiz.rank3');
  if (score >= 4) return t('tools.quiz.rank2');
  return t('tools.quiz.rank1');
}

export default function DistrictQuiz() {
  const toast = useToast();
  const [rounds, setRounds] = useState(newGame);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const done = index >= ROUNDS;
  const round = rounds[index];

  // Zoom the map towards the target district so small ones are visible
  const viewBox = useMemo(() => {
    if (!round) return `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;
    const size = 420;
    const x = Math.min(Math.max(round.answer.cx - size / 2, 0), MAP_WIDTH - size);
    const y = Math.min(Math.max(round.answer.cy - size / 2, 0), MAP_HEIGHT - size);
    return `${x} ${y} ${size} ${size}`;
  }, [round]);

  const choose = (d) => {
    if (picked) return;
    setPicked(d.slug);
    if (d.slug === round.answer.slug) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      setIndex((i) => i + 1);
    }, 1100);
  };

  const restart = () => {
    setRounds(newGame());
    setIndex(0);
    setScore(0);
    setPicked(null);
  };

  async function share() {
    const text = t('tools.quiz.shareText').replace('{score}', num(score)).replace('{total}', num(ROUNDS));
    const url = `${window.location.origin}/tools/quiz`;
    try {
      if (navigator.share) await navigator.share({ title: t('tools.quiz.name'), text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast(t('myMap.linkCopied'), 'success');
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Seo title={t('tools.quiz.name')} description={t('tools.quiz.desc')} />
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" /> {t('tools.quiz.name')}
        </h1>
        {!done && (
          <span className="badge badge-lg badge-primary font-bold">
            {num(index + 1)}/{num(ROUNDS)} · ⭐ {num(score)}
          </span>
        )}
      </div>

      {done ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card bg-base-100 shadow-lg">
          <div className="card-body items-center text-center gap-4 py-12">
            <Trophy className="w-14 h-14 text-warning" />
            <div className="text-5xl font-extrabold text-primary">
              {num(score)}/{num(ROUNDS)}
            </div>
            <p className="text-lg font-semibold">{verdict(score)}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn btn-primary rounded-full" onClick={restart}>
                <RotateCcw className="w-4 h-4" /> {t('tools.quiz.again')}
              </button>
              <button className="btn btn-outline rounded-full" onClick={share}>
                <Share2 className="w-4 h-4" /> {t('tools.quiz.share')}
              </button>
              <Link to="/my-map" className="btn btn-ghost rounded-full">{t('myMap.title')}</Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px] items-start">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-3">
              <p className="text-center text-sm text-base-content/60">{t('tools.quiz.question')}</p>
              <motion.svg
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                viewBox={viewBox}
                className="w-full aspect-square"
                aria-label={t('tools.quiz.question')}
              >
                {DISTRICTS.map((d) => (
                  <path
                    key={d.slug}
                    d={d.d}
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                    className={`stroke-base-100 ${
                      d.slug === round.answer.slug
                        ? picked
                          ? picked === d.slug
                            ? 'fill-success'
                            : 'fill-error'
                          : 'fill-primary animate-pulse'
                        : 'fill-primary/15'
                    }`}
                  />
                ))}
              </motion.svg>
            </div>
          </div>
          <div className="grid gap-2">
            {round.choices.map((d) => {
              const isAnswer = d.slug === round.answer.slug;
              const state = picked ? (isAnswer ? 'btn-success' : picked === d.slug ? 'btn-error' : 'btn-ghost opacity-50') : 'btn-outline';
              return (
                <button key={d.slug} className={`btn rounded-xl justify-between ${state}`} onClick={() => choose(d)}>
                  {nameOf(d)}
                  {picked && isAnswer && <Check className="w-4 h-4" />}
                  {picked === d.slug && !isAnswer && <X className="w-4 h-4" />}
                </button>
              );
            })}
            <p className="text-xs text-base-content/50 mt-2">
              {t('tools.quiz.division')}: {t(`district.divisions.${round.answer.division}`)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
