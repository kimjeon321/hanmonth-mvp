// 지원 사업 카드. compact=true면 지도 화면용 짧은 버전, eligible=true면 "자격 충족" 표시
// 모든 사업은 공식 신청·공고 페이지 링크와 모집 상태를 함께 보여줍니다.
// (policy.source의 기사 링크는 데이터 확인용으로만 남겨 둡니다)
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
      <div className="apply-row">
        <a className="apply-link" href={policy.apply.url} target="_blank" rel="noreferrer">
          신청·공고 보기 ↗
        </a>
        <span className="small muted">
          {policy.apply.name}
          {policy.apply.hint && ` · ${policy.apply.hint}`}
        </span>
      </div>
    </div>
  );
}
