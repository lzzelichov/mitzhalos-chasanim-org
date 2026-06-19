'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(end: number, run: boolean, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, run, duration]);
  return val;
}

export default function StatCounter({ end, prefix = '', label }: { end: number; prefix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const v = useCountUp(end, run);
  return (
    <div ref={ref} className="card text-center">
      <p className="font-display text-[2.5rem] font-black leading-none text-burgundy">
        {prefix}
        {Math.round(v).toLocaleString('en-US')}
      </p>
      <p className="mt-2 font-sans text-[0.85rem] text-[#888]">{label}</p>
    </div>
  );
}
