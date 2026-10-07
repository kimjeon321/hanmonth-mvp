import { useEffect, useState } from 'react';

// 숫자가 0부터 목표값까지 올라가는 애니메이션
export default function CountUp({ to, duration = 1200 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // 애니메이션이 멈추는 환경(백그라운드 탭 등)에서도 최종 숫자는 꼭 보이게
    const done = setTimeout(() => setValue(to), duration + 200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(done);
    };
  }, [to, duration]);

  return <>{value.toLocaleString()}</>;
}
