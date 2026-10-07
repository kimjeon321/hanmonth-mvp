import { forwardRef } from 'react';
import { formatWon } from '../data';

// 인스타 스토리 비율(9:16) 처방전 카드. 이미지 저장 시 이 영역만 캡처합니다.
const PrescriptionCard = forwardRef(function PrescriptionCard({ type, region, match, date }, ref) {
  return (
    <div className="rx-card" ref={ref} style={{ '--type-color': type.color }}>
      <div className="rx-top">
        <span className="rx-brand">🏡 한달살이</span>
        <span className="rx-label">한 달 살기 처방전</span>
      </div>

      <div className="rx-type">
        <span className="rx-emoji">{type.emoji}</span>
        <p className="rx-small">나의 번아웃 유형</p>
        <h2>{type.name}</h2>
        <p className="rx-desc">{type.summary}</p>
      </div>

      <div className="rx-box">
        <p className="rx-small">처방 지역</p>
        <h3>{region.emoji} {region.province} {region.name}</h3>
        <p>{type.prescription}</p>
      </div>

      <div className="rx-box">
        <p className="rx-small">이 처방, 정부·지자체 지원 사업과 함께</p>
        <h3>
          {match.supportTotal
            ? `최대 ${formatWon(match.supportTotal)}`
            : `지원 사업 ${match.eligibleIds.length}건`}
        </h3>
        <p>
          대상 사업 {match.eligibleIds.length}건 · 지금 신청 가능 {match.openCount}건 (최근 공고 기준)
        </p>
      </div>

      <p className="rx-living">
        나의 한 달이<br />
        <strong>{region.name}의 생활인구가 됩니다</strong>
      </p>

      <div className="rx-foot">
        <span>매칭 점수 {match.total}점</span>
        <span>{date}</span>
      </div>
    </div>
  );
});

export default PrescriptionCard;
