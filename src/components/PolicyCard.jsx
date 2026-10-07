// 지원 사업 카드. compact=true면 지도 화면용 짧은 버전, eligible=true면 "자격 충족" 표시
// 모든 사업은 출처 링크와 모집 상태를 함께 보여줍니다.
export default function PolicyCard({ policy, compact = false, eligible = false }) {
  return (
    <div className={`policy-card ${eligible ? 'eligible' : ''}`}>
      <div className="policy-head">
        <strong>
          {eligible && <span className="ok-mark">✓ 대상 </span>}
          {policy.title}
        </strong>
        <span className="badge">{policy.amount}</span>
      </div>
      <p className="muted small">{policy.organizer} · {policy.support}</p>
      <p className="small">
        <span className={`status ${policy.isOpen ? 'open' : 'closed'}`}>
          {policy.isOpen ? '● 신청 가능' : '○ 확인 필요'}
        </span>{' '}
        <span className="muted">{policy.status}</span>
      </p>
      {!compact && (
        <dl className="policy-detail">
          <dt>기간</dt>
          <dd>{policy.period}</dd>
          <dt>대상</dt>
          <dd>{policy.target}</dd>
          <dt>조건</dt>
          <dd>{policy.condition}</dd>
          {policy.amountNote && (
            <>
              <dt>금액</dt>
              <dd className="muted">{policy.amountNote}</dd>
            </>
          )}
        </dl>
      )}
      <p className="source small">
        출처:{' '}
        <a href={policy.source.url} target="_blank" rel="noreferrer">
          {policy.source.name} ↗
        </a>
      </p>
    </div>
  );
}
