import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from './Video';

const bars = [
  {label: 'Payment history', pct: 35, color: C.green},
  {label: 'Amounts owed', pct: 30, color: C.blue},
  {label: 'History length', pct: 15, color: C.violet},
  {label: 'New credit', pct: 10, color: C.amber},
  {label: 'Credit mix', pct: 10, color: C.orange},
];

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{fontFamily: 'Inter, sans-serif', background: `radial-gradient(circle at 25% 20%, ${C.bg2} 0%, ${C.bg} 65%)`, padding: 60, flexDirection: 'row', alignItems: 'center', gap: 50}}>
    <div style={{flex: 1.15}}>
      <div style={{fontSize: 46, fontWeight: 800, color: C.yellow, letterSpacing: 1}}>YOUR CREDIT SCORE</div>
      <div style={{fontSize: 118, fontWeight: 900, color: C.ink, lineHeight: 0.98, letterSpacing: -3, marginTop: 10}}>
        How It<br />Really <span style={{color: C.green}}>Works</span>
      </div>
      <div style={{display: 'inline-block', marginTop: 28, fontSize: 40, fontWeight: 800, color: C.bg, background: C.yellow, padding: '10px 26px', borderRadius: 14}}>300 → 850</div>
    </div>
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 20}}>
      {bars.map((b) => (
        <div key={b.label}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 700, color: C.ink, marginBottom: 6}}>
            <span>{b.label}</span><span style={{color: b.color}}>{b.pct}%</span>
          </div>
          <div style={{height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.08)'}}>
            <div style={{height: 30, borderRadius: 15, width: `${(b.pct / 35) * 100}%`, background: b.color}} />
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
