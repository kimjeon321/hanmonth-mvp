// 인포그래픽: 228개 시군구를 칸 하나씩으로 그리고, 소멸위험 지역을 색칠합니다.
export default function ExtinctionGrid({ total, atRisk }) {
  return (
    <div>
      <div className="unit-grid" role="img" aria-label={`전국 ${total}개 시군구 중 ${atRisk}곳이 소멸위험지역`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < atRisk ? 'on' : ''} />
        ))}
      </div>
      <div className="unit-legend small">
        <span><i className="dot on" /> 소멸위험지역 {atRisk}곳</span>
        <span><i className="dot" /> 그 외 {total - atRisk}곳</span>
      </div>
    </div>
  );
}
