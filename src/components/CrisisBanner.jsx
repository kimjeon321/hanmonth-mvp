// 한 줄 서술에서 위기 신호가 보이면 상담 연락처를 안내합니다.
export default function CrisisBanner() {
  return (
    <div className="crisis-banner" role="alert">
      <strong>💛 많이 힘드신가요? 혼자 견디지 않아도 괜찮아요.</strong>
      <p>
        지금 바로 이야기할 곳이 있어요. <a href="tel:109">자살예방상담전화 109</a> (24시간) ·{' '}
        <a href="tel:15770199">정신건강위기상담 1577-0199</a>
      </p>
    </div>
  );
}
