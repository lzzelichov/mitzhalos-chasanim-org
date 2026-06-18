// Browser-only confetti helpers. Dynamically imported so they never run on the server.
// Rose-gold celebratory palette.
const GOLD = ['#e8b4b8', '#c9a84c', '#b76e79', '#e3cd8a', '#f5e6d3', '#7a1f3d'];

export async function celebrate(): Promise<void> {
  if (typeof window === 'undefined') return;
  const confetti = (await import('canvas-confetti')).default;
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: GOLD });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export async function burst(): Promise<void> {
  if (typeof window === 'undefined') return;
  const confetti = (await import('canvas-confetti')).default;
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: GOLD });
}
