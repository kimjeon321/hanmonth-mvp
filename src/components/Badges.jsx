// 작은 표시 배지들

// 시연용 샘플 데이터 표시
export function SampleBadge({ label = '시연용 샘플' }) {
  return <span className="sample-badge">{label}</span>;
}

// AI 분석 / 기본 분석 모드 표시
export function ModeBadge({ mode }) {
  return mode === 'ai' ? (
    <span className="mode-badge ai">✨ AI 분석</span>
  ) : (
    <span className="mode-badge rule" title="AI 연결 없이 규칙 기반으로 분석했어요">⚙️ 기본 분석 모드</span>
  );
}
