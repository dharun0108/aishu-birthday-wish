import { useEffect, useState } from 'react';

/**
 * A playful startup loader: a boy and a girl bicker over the birthday
 * girl while a progress bar fills. The moment it reaches 100%, they stop
 * fighting and make up. ♡
 */
export default function FightLoader({ onDone, reduced }: { onDone: () => void; reduced: boolean }) {
  const [progress, setProgress] = useState(0);
  const done = progress >= 100;

  // Fill the bar. (Also gives the lazy 3D scene a moment to preload.)
  useEffect(() => {
    if (reduced) { setProgress(100); return; }
    let raf = 0;
    const start = performance.now();
    const duration = 3800;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Once the fight is over, reveal the app.
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(onDone, reduced ? 300 : 1200);
    return () => window.clearTimeout(t);
  }, [done, onDone, reduced]);

  return (
    <div className={`fight-loader ${done ? 'made-up' : ''} ${reduced ? 'reduced' : ''}`} role="status" aria-live="polite" aria-label="Loading">
      <div className="fight-scene" aria-hidden="true">
        <span className="mark mark-1">💢</span>
        <span className="mark mark-2">💢</span>
        <span className="fighter boy">👦</span>
        <span className="clash">{done ? '❤️' : '💥'}</span>
        <span className="fighter girl">👧</span>
      </div>
      <p className="fight-caption handwritten">
        {done ? 'okay okay — we agree, it’s you. ♡' : 'arguing over who loves you more…'}
      </p>
      <div className="loader-bar"><span style={{ width: `${progress}%` }} /></div>
      <p className="loader-percent handwritten">{done ? 'ready! ♡' : `${Math.round(progress)}%`}</p>
    </div>
  );
}
