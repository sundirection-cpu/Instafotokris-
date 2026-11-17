import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import timeline from './timeline.json';

export const FPS = 30;
type Sub = {text: string; start: number; end: number};
type Scene = {id: string; start: number; duration: number; subs: Sub[]};
const TL = timeline as Scene[];
const last = TL[TL.length - 1];
export const TOTAL = Math.ceil((last.start + last.duration + 1.5) * FPS);

export const C = {
  bg: '#0A1324', bg2: '#13244A', card: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.12)',
  ink: '#F8FAFC', mute: '#94A3B8', green: '#22C55E', lime: '#A3E635', yellow: '#FACC15',
  orange: '#FB923C', red: '#EF4444', blue: '#38BDF8', violet: '#A78BFA', amber: '#F59E0B',
};
const FONT = 'Inter, sans-serif';

// ---------- helpers ----------
const f = (sec: number) => Math.round(sec * FPS);
const usePop = (at: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping}});
};
const ease = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const subAt = (s: Scene, i: number) => f(s.subs[Math.min(i, s.subs.length - 1)].start);

const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{background: C.card, border: `2px solid ${C.line}`, borderRadius: 28, padding: '28px 36px', ...style}}>{children}</div>
);

const Title: React.FC<{kicker?: string; text: string; color?: string}> = ({kicker, text, color = C.ink}) => {
  const p = usePop(0);
  return (
    <div style={{position: 'absolute', top: 120, left: 140, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      {kicker && <div style={{fontSize: 30, letterSpacing: 6, color: C.mute, fontWeight: 600, marginBottom: 12}}>{kicker}</div>}
      <div style={{fontSize: 76, fontWeight: 800, color, letterSpacing: -1.5}}>{text}</div>
    </div>
  );
};

// ---------- gauge ----------
const BANDS = [
  {from: 300, to: 579, label: 'Poor', range: '300–579', color: C.red},
  {from: 580, to: 669, label: 'Fair', range: '580–669', color: C.orange},
  {from: 670, to: 739, label: 'Good', range: '670–739', color: C.yellow},
  {from: 740, to: 799, label: 'Very good', range: '740–799', color: C.lime},
  {from: 800, to: 850, label: 'Exceptional', range: '800–850', color: C.green},
];
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
};
const arc = (cx: number, cy: number, r: number, d1: number, d2: number) => {
  const [x1, y1] = polar(cx, cy, r, d1);
  const [x2, y2] = polar(cx, cy, r, d2);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
};
const scoreDeg = (v: number) => 180 - ((v - 300) / 550) * 180;

const Gauge: React.FC<{value: number; size?: number}> = ({value, size = 900}) => {
  const cx = 450, cy = 470, r = 360;
  const [nx, ny] = polar(cx, cy, r, scoreDeg(value));
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 900 560">
      {BANDS.map((b) => (
        <path key={b.label} d={arc(cx, cy, r, scoreDeg(b.from) - 0.6, scoreDeg(b.to + 1) + 0.6)} stroke={b.color} strokeWidth={56} fill="none" />
      ))}
      <circle cx={nx} cy={ny} r={42} fill={C.bg} stroke={C.ink} strokeWidth={10} />
      <text x={cx - r} y={cy + 70} fill={C.mute} fontSize={34} textAnchor="middle" fontFamily={FONT}>300</text>
      <text x={cx + r} y={cy + 70} fill={C.mute} fontSize={34} textAnchor="middle" fontFamily={FONT}>850</text>
    </svg>
  );
};

// ---------- scenes ----------
const Hook: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const items = ['Apartment approval', 'Car loan rate', 'Mortgage rate'];
  const g = usePop(subAt(s, 1));
  const out = ease(frame, subAt(s, 1) - 8, subAt(s, 1) + 6);
  const val = Math.round(ease(frame, subAt(s, 1), subAt(s, 1) + 50, 300, 742));
  const tag = usePop(subAt(s, 3));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 40, opacity: 1 - out, transform: `scale(${1 - out * 0.2})`, position: 'absolute'}}>
        {items.map((t, i) => {
          const p = usePop(8 + i * 14);
          return (
            <Card key={t} style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`, fontSize: 44, fontWeight: 700, color: C.ink, width: 420, textAlign: 'center'}}>
              <div style={{fontSize: 26, color: C.mute, marginBottom: 10, letterSpacing: 4}}>DECIDED BY</div>
              {t}
            </Card>
          );
        })}
      </div>
      <div style={{opacity: g, transform: `scale(${0.85 + g * 0.15})`, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -60}}>
        <div style={{fontSize: 40, letterSpacing: 8, color: C.mute, fontWeight: 700}}>YOUR CREDIT SCORE</div>
        <div style={{position: 'relative'}}>
          <Gauge value={val} size={820} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontSize: 130, fontWeight: 800, color: C.ink}}>{val}</div>
        </div>
        <div style={{opacity: tag, fontSize: 48, fontWeight: 700, color: C.green, marginTop: -10}}>How it's actually calculated</div>
      </div>
    </AbsoluteFill>
  );
};

const Range: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const show = [subAt(s, 1), subAt(s, 1) + 40, subAt(s, 2), subAt(s, 2) + 45, subAt(s, 3)];
  const W = 1560, x0 = 180;
  const axis = usePop(10);
  return (
    <AbsoluteFill>
      <Title kicker="THE FICO SCORE" text="300 to 850" />
      <div style={{position: 'absolute', top: 430, left: x0, width: W, opacity: axis}}>
        <div style={{position: 'relative', height: 110, background: 'rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden'}}>
          {BANDS.map((b, i) => {
            const w = ((b.to + 1 - b.from) / 551) * W;
            const left = ((b.from - 300) / 551) * W;
            const grow = ease(frame, show[i], show[i] + 18);
            return <div key={b.label} style={{position: 'absolute', left, width: w * grow, top: 0, bottom: 0, background: b.color, borderRight: `4px solid ${C.bg}`}} />;
          })}
        </div>
        {BANDS.map((b, i) => {
          const left = ((b.from - 300) / 551) * W;
          const w = ((b.to + 1 - b.from) / 551) * W;
          const p = ease(frame, show[i] + 6, show[i] + 22);
          return (
            <div key={b.label} style={{position: 'absolute', left, width: w, top: 140, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
              <div style={{fontSize: b.label === 'Exceptional' ? 32 : 40, fontWeight: 800, color: b.color}}>{b.label}</div>
              <div style={{fontSize: 30, color: C.mute, marginTop: 6}}>{b.range}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FACTORS = [
  {key: 'payment', label: 'Payment history', pct: 35, color: C.green},
  {key: 'utilization', label: 'Amounts owed', pct: 30, color: C.blue},
  {key: 'length', label: 'Length of history', pct: 15, color: C.violet},
  {key: 'new', label: 'New credit', pct: 10, color: C.amber},
  {key: 'mix', label: 'Credit mix', pct: 10, color: C.orange},
];

const Donut: React.FC<{size: number; progress?: number[]; highlight?: string[]}> = ({size, progress, highlight}) => {
  const r = 150, cx = 200, cy = 200, circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{transform: 'rotate(-90deg)'}}>
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={70} fill="none" />
      {FACTORS.map((fct, i) => {
        const p = progress ? progress[i] : 1;
        const len = (fct.pct / 100) * circ;
        const dim = highlight && !highlight.includes(fct.key);
        const el = (
          <circle key={fct.key} cx={cx} cy={cy} r={r} fill="none" stroke={fct.color} strokeWidth={70}
            strokeDasharray={`${Math.max(len * p - 4, 0)} ${circ}`} strokeDashoffset={-acc} opacity={dim ? 0.18 : 1} />
        );
        acc += len;
        return el;
      })}
    </svg>
  );
};

const Pie: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const prog = FACTORS.map((_, i) => ease(frame, 6 + i * 12, 22 + i * 12));
  const big = ease(frame, subAt(s, 1), subAt(s, 1) + 12);
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110}}>
      <Donut size={620} progress={prog} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
        {FACTORS.map((fct, i) => (
          <div key={fct.key} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: prog[i], transform: `scale(${i === 0 ? 1 + big * 0.12 : 1})`, transformOrigin: 'left center'}}>
            <div style={{width: 130, fontSize: 64, fontWeight: 800, color: fct.color, textAlign: 'right'}}>{fct.pct}%</div>
            <div style={{fontSize: 48, fontWeight: 600, color: C.ink}}>{fct.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FactorHeader: React.FC<{keys: string[]; pct: string; label: string; color: string}> = ({keys, pct, label, color}) => {
  const p = usePop(0);
  return (
    <div style={{position: 'absolute', top: 100, left: 130, display: 'flex', alignItems: 'center', gap: 36, opacity: p}}>
      <Donut size={170} highlight={keys} />
      <div>
        <div style={{fontSize: 96, fontWeight: 800, color, lineHeight: 1}}>{pct}</div>
        <div style={{fontSize: 52, fontWeight: 700, color: C.ink}}>{label}</div>
      </div>
    </div>
  );
};

const Payment: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const late = ease(frame, subAt(s, 2), subAt(s, 2) + 12);
  const seven = usePop(subAt(s, 2) + 45);
  const auto = ease(frame, subAt(s, 3) + 20, subAt(s, 3) + 34);
  const autoCard = usePop(subAt(s, 3));
  return (
    <AbsoluteFill>
      <FactorHeader keys={['payment']} pct="35%" label="Payment history" color={C.green} />
      <div style={{position: 'absolute', top: 400, left: 130, display: 'flex', gap: 18}}>
        {months.map((m, i) => {
          const p = ease(frame, subAt(s, 1) + i * 3, subAt(s, 1) + i * 3 + 10);
          const isLate = i === 7;
          const col = isLate ? (late > 0.5 ? C.red : C.green) : C.green;
          return (
            <div key={i} style={{width: 118, height: 150, borderRadius: 20, background: C.card, border: `3px solid ${isLate && late > 0.5 ? C.red : C.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${isLate ? 1 + late * 0.12 : 1})`}}>
              <div style={{fontSize: 30, color: C.mute, fontWeight: 600}}>{m}</div>
              <div style={{fontSize: 64, fontWeight: 800, color: col}}>{isLate && late > 0.5 ? '✕' : '✓'}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 590, left: 130 + 7 * 136 - 120, opacity: late, fontSize: 36, fontWeight: 700, color: C.red, width: 380, textAlign: 'center'}}>30+ days late</div>
      <Card style={{position: 'absolute', top: 650, left: 130, opacity: seven, transform: `scale(${0.9 + seven * 0.1})`, borderColor: C.red}}>
        <div style={{fontSize: 44, fontWeight: 700, color: C.ink}}>Can stay on your report <span style={{color: C.red}}>up to 7 years</span></div>
      </Card>
      <Card style={{position: 'absolute', top: 650, right: 130, opacity: autoCard, display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{fontSize: 46, fontWeight: 800, color: C.ink}}>AUTOPAY</div>
        <div style={{width: 150, height: 80, borderRadius: 40, background: auto > 0.5 ? C.green : '#334155', position: 'relative'}}>
          <div style={{position: 'absolute', top: 8, left: 8 + auto * 70, width: 64, height: 64, borderRadius: 32, background: C.ink}} />
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const Utilization: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const formula = usePop(subAt(s, 1));
  const fill1 = ease(frame, subAt(s, 2) + 20, subAt(s, 2) + 70, 0, 0.5);
  const fill2 = ease(frame, subAt(s, 3) + 60, subAt(s, 3) + 100, 0, 0.41);
  const fill = fill1 - fill2;
  const pct = Math.round(fill * 100);
  const col = pct > 30 ? C.red : pct > 10 ? C.yellow : C.green;
  const m30 = ease(frame, subAt(s, 3), subAt(s, 3) + 14);
  const m10 = ease(frame, subAt(s, 3) + 60, subAt(s, 3) + 74);
  const barShow = usePop(subAt(s, 2));
  const W = 1500;
  return (
    <AbsoluteFill>
      <FactorHeader keys={['utilization']} pct="30%" label="Amounts owed · utilization" color={C.blue} />
      <Card style={{position: 'absolute', top: 360, left: 130, opacity: formula, fontSize: 46, fontWeight: 700, color: C.ink}}>
        Card balances <span style={{color: C.mute}}>÷</span> Credit limits <span style={{color: C.mute}}>=</span> <span style={{color: C.blue}}>Utilization</span>
      </Card>
      <div style={{position: 'absolute', top: 560, left: 210, width: W, opacity: barShow}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, color: C.mute, marginBottom: 14}}>
          <span>Balance: <b style={{color: C.ink}}>${Math.round(fill * 5000).toLocaleString('en-US')}</b></span>
          <span>Limit: <b style={{color: C.ink}}>$5,000</b></span>
        </div>
        <div style={{position: 'relative', height: 90, borderRadius: 45, background: 'rgba(255,255,255,0.07)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: W * fill, borderRadius: 45, background: col}} />
          {[{v: 0.3, o: m30, t: 'Under 30%'}, {v: 0.1, o: m10, t: 'Top scorers: under 10%'}].map((m) => (
            <div key={m.t} style={{position: 'absolute', left: W * m.v, top: -20, bottom: -20, borderLeft: `4px dashed ${C.ink}`, opacity: m.o}}>
              <div style={{position: 'absolute', top: 120, left: -10, fontSize: 30, color: C.ink, fontWeight: 700, whiteSpace: 'nowrap', transform: m.v === 0.1 ? 'translateX(-60%)' : 'translateX(-30%)'}}>{m.t}</div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', right: 0, top: 150, fontSize: 80, fontWeight: 800, color: col}}>{pct}%{pct >= 45 ? <span style={{fontSize: 40, marginLeft: 16}}>RISKY</span> : null}</div>
      </div>
    </AbsoluteFill>
  );
};

const Length: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const cards = [{n: 'Oldest card', y: 'opened 12 years ago', age: 12}, {n: 'Card B', y: 'opened 7 years ago', age: 7}, {n: 'Card C', y: 'opened 2 years ago', age: 2}];
  const close = ease(frame, subAt(s, 2) + 25, subAt(s, 2) + 40);
  const avg = close > 0.5 ? 4.5 : 7;
  return (
    <AbsoluteFill>
      <FactorHeader keys={['length']} pct="15%" label="Length of credit history" color={C.violet} />
      <div style={{position: 'absolute', top: 410, left: 130, display: 'flex', gap: 40}}>
        {cards.map((c, i) => {
          const p = ease(frame, subAt(s, 1) + i * 8, subAt(s, 1) + i * 8 + 14);
          const isOld = i === 0;
          return (
            <div key={c.n} style={{position: 'relative', width: 420, height: 250, borderRadius: 28, padding: 32, boxSizing: 'border-box',
              background: `linear-gradient(135deg, ${C.violet}, #6D28D9)`, opacity: p * (isOld ? 1 - close * 0.65 : 1), transform: `translateY(${(1 - p) * 40}px)`}}>
              <div style={{fontSize: 40, fontWeight: 800, color: C.ink}}>{c.n}</div>
              <div style={{fontSize: 32, color: 'rgba(255,255,255,0.85)', marginTop: 10}}>{c.y}</div>
              <div style={{position: 'absolute', bottom: 28, left: 32, width: 80, height: 56, borderRadius: 10, background: 'rgba(255,255,255,0.35)'}} />
              {isOld && close > 0 && (
                <svg style={{position: 'absolute', inset: 0}} width={420} height={250}>
                  <line x1={40} y1={40} x2={40 + 340 * close} y2={40 + 170 * close} stroke={C.red} strokeWidth={14} strokeLinecap="round" />
                  <line x1={380} y1={40} x2={380 - 340 * close} y2={40 + 170 * close} stroke={C.red} strokeWidth={14} strokeLinecap="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      <Card style={{position: 'absolute', top: 720, left: 130, opacity: ease(frame, subAt(s, 1) + 30, subAt(s, 1) + 44), fontSize: 46, fontWeight: 700, color: C.ink}}>
        Average account age: <span style={{color: close > 0.5 ? C.red : C.violet}}>{avg} years</span>
        {close > 0.5 && <span style={{fontSize: 32, color: C.mute, marginLeft: 20}}>(over time, after closing)</span>}
      </Card>
    </AbsoluteFill>
  );
};

const NewMix: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const a = usePop(subAt(s, 1));
  const b = usePop(subAt(s, 2));
  const warn = usePop(subAt(s, 2) + f(3.2));
  return (
    <AbsoluteFill>
      <Title kicker="THE LAST TWO" text="10% + 10%" />
      <div style={{position: 'absolute', top: 360, left: 130, right: 130, display: 'flex', gap: 60}}>
        <Card style={{flex: 1, opacity: a, transform: `translateY(${(1 - a) * 40}px)`, borderColor: C.amber}}>
          <div style={{fontSize: 70, fontWeight: 800, color: C.amber}}>10%</div>
          <div style={{fontSize: 54, fontWeight: 800, color: C.ink}}>New credit</div>
          <div style={{fontSize: 38, color: C.mute, marginTop: 24, lineHeight: 1.35}}>Each application → <b style={{color: C.ink}}>hard inquiry</b><br />A few points, for a while</div>
        </Card>
        <Card style={{flex: 1, opacity: b, transform: `translateY(${(1 - b) * 40}px)`, borderColor: C.orange}}>
          <div style={{fontSize: 70, fontWeight: 800, color: C.orange}}>10%</div>
          <div style={{fontSize: 54, fontWeight: 800, color: C.ink}}>Credit mix</div>
          <div style={{display: 'flex', gap: 20, marginTop: 24}}>
            {['Credit card', 'Loan'].map((t) => (
              <div key={t} style={{fontSize: 36, fontWeight: 700, color: C.ink, padding: '12px 26px', borderRadius: 40, border: `3px solid ${C.orange}`}}>{t}</div>
            ))}
          </div>
          <div style={{opacity: warn, fontSize: 36, fontWeight: 700, color: C.red, marginTop: 26}}>Never borrow just for this</div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

const Myth: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const t = usePop(4);
  const strike = ease(frame, subAt(s, 1), subAt(s, 1) + 18);
  const soft = usePop(subAt(s, 1) + f(2.2));
  const url = usePop(subAt(s, 2));
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{marginTop: 150, fontSize: 34, letterSpacing: 8, color: C.mute, fontWeight: 700, opacity: t}}>MYTH</div>
      <div style={{position: 'relative', marginTop: 10, fontSize: 82, fontWeight: 800, color: C.ink, opacity: t}}>
        “Checking my score hurts it”
        <div style={{position: 'absolute', left: 0, top: '52%', height: 12, width: `${strike * 100}%`, background: C.red, borderRadius: 6}} />
      </div>
      <Card style={{marginTop: 50, opacity: soft, transform: `scale(${0.9 + soft * 0.1})`, borderColor: C.green, fontSize: 52, fontWeight: 800, color: C.ink}}>
        Your own check = <span style={{color: C.green}}>soft inquiry · 0 impact</span>
      </Card>
      <div style={{marginTop: 50, opacity: url, transform: `translateY(${(1 - url) * 30}px)`, textAlign: 'center'}}>
        <div style={{fontSize: 56, fontWeight: 800, color: C.blue}}>annualcreditreport.com</div>
        <div style={{display: 'flex', gap: 22, justifyContent: 'center', marginTop: 22}}>
          {['Equifax', 'Experian', 'TransUnion'].map((b) => (
            <div key={b} style={{fontSize: 34, fontWeight: 700, color: C.ink, padding: '10px 26px', borderRadius: 40, background: C.card, border: `2px solid ${C.line}`}}>{b}</div>
          ))}
          <div style={{fontSize: 34, fontWeight: 800, color: C.bg, padding: '10px 26px', borderRadius: 40, background: C.green}}>FREE</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{s: Scene}> = ({s}) => {
  const frame = useCurrentFrame();
  const l1 = s.subs[1];
  const span = f(l1.end - l1.start);
  const items = ['Pay on time', 'Keep balances low', 'Keep old accounts open', 'Apply only when you need it'];
  const next = usePop(subAt(s, 3));
  return (
    <AbsoluteFill>
      <Title kicker="RECAP" text="4 habits that build your score" />
      <div style={{position: 'absolute', top: 340, left: 140, display: 'flex', flexDirection: 'column', gap: 30, opacity: 1 - ease(frame, subAt(s, 3) - 6, subAt(s, 3) + 6) * 0.7}}>
        {items.map((t, i) => {
          const at = subAt(s, 1) + Math.round((span * i) / 4);
          const p = ease(frame, at, at + 10);
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: 0.25 + p * 0.75}}>
              <div style={{width: 76, height: 76, borderRadius: 18, border: `4px solid ${p > 0.5 ? C.green : C.mute}`, background: p > 0.5 ? C.green : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, color: C.bg}}>{p > 0.5 ? '✓' : ''}</div>
              <div style={{fontSize: 60, fontWeight: 700, color: C.ink}}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 140, top: 400, opacity: next, transform: `scale(${0.85 + next * 0.15})`, textAlign: 'center'}}>
        <Card style={{borderColor: C.green}}>
          <div style={{fontSize: 30, letterSpacing: 6, color: C.mute, fontWeight: 700}}>NEXT VIDEO</div>
          <div style={{fontSize: 52, fontWeight: 800, color: C.ink, marginTop: 10}}>How to raise<br />your score fast</div>
        </Card>
        <div style={{marginTop: 30, display: 'inline-block', fontSize: 44, fontWeight: 800, color: C.ink, background: C.red, padding: '18px 48px', borderRadius: 16}}>SUBSCRIBE</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{s: Scene}>> = {hook: Hook, range: Range, pie: Pie, payment: Payment, utilization: Utilization, length: Length, newmix: NewMix, myth: Myth, recap: Recap};

// ---------- chrome ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${30 + Math.sin(frame / 200) * 10}% 20%, ${C.bg2} 0%, ${C.bg} 60%)`}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 2px, transparent 2px)', backgroundSize: '48px 48px', backgroundPosition: `${frame * 0.2}px 0px`}} />
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let cur: Sub | null = null;
  for (const s of TL) for (const sub of s.subs) if (t >= s.start + sub.start && t < s.start + sub.end + 0.25) cur = sub;
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', bottom: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 1500, fontSize: 40, lineHeight: 1.3, fontWeight: 600, color: C.ink, background: 'rgba(5,10,20,0.72)', padding: '14px 30px', borderRadius: 16, textAlign: 'center'}}>{cur.text}</div>
    </div>
  );
};

const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', top: 44, left: 56, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: C.mute}}>
        <span style={{color: C.green}}>●</span> MONEY, EXPLAINED
      </div>
      <div style={{position: 'absolute', top: 0, left: 0, height: 6, width: `${(frame / TOTAL) * 100}%`, background: C.green}} />
    </>
  );
};

const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const o = Math.min(ease(frame, 0, 10), 1 - ease(frame, dur - 10, dur));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Main: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT, background: C.bg}}>
    <Background />
    {TL.map((s) => {
      const S = SCENES[s.id];
      const dur = f(s.duration) + (s === last ? f(1.5) : 0);
      return (
        <Sequence key={s.id} from={f(s.start)} durationInFrames={dur}>
          <Fade dur={dur}><S s={s} /></Fade>
        </Sequence>
      );
    })}
    <Brand />
    <Subtitles />
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
