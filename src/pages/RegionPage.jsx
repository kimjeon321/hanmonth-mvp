import { Link, useParams } from 'react-router-dom';
import { getRegion, getPolicies, getPlaces, getSpending, formatWon } from '../data';
import PolicyCard from '../components/PolicyCard';
import PlaceList from '../components/PlaceList';
import SpendingChart from '../components/SpendingChart';
import { SampleBadge } from '../components/Badges';
import { withJosa } from '../utils/korean';

export default function RegionPage() {
  const { id } = useParams();
  const region = getRegion(id);

  if (!region) {
    return (
      <div className="page">
        <p>지역을 찾을 수 없어요.</p>
        <Link to="/map" className="btn">지도로 돌아가기</Link>
      </div>
    );
  }

  const policies = getPolicies(id);
  const places = getPlaces(id);

  return (
    <div className="page">
      <Link to="/map" className="back-link">← 지도로</Link>

      <header className="hero">
        <p className="muted small">
          {region.province} · <span className="risk-tag">인구감소지역</span>
        </p>
        <h1>{region.emoji} {region.name} 한 달 살기</h1>
        <p className="tagline">{region.tagline}</p>
        <p>{region.description}</p>
        <div className="chips">
          {region.highlights.map((h) => <span key={h} className="tag">#{h}</span>)}
        </div>
        <div className="stat-row">
          <div className="stat">
            <span className="muted small">예상 한 달 생활비 <SampleBadge label="추정" /></span>
            <strong>{formatWon(region.monthlyCost)}</strong>
          </div>
          <div className="stat">
            <span className="muted small">지원 사업</span>
            <strong>{policies.length}건</strong>
          </div>
          <div className="stat">
            <span className="muted small">지금 신청 가능</span>
            <strong>{policies.filter((p) => p.isOpen).length}건</strong>
          </div>
        </div>
      </header>

      <section className="card living">
        <p className="section-eyebrow">이 지역에는 사람이 필요해요</p>
        <p>
          {withJosa(region.name, '은', '는')} 2021년 10월 행정안전부가 지정한 <strong>인구감소지역</strong>이에요.
        </p>
        <p className="small">
          한 달 동안 머물면 {region.name}의 <strong>생활인구 1명</strong>으로 집계되고, 지역에서 생활비를 쓰게 돼요.
        </p>
      </section>

      <div className="detail-grid">
        <section className="card">
          <h2>🎁 지원 정책</h2>
          {policies.map((p) => <PolicyCard key={p.id} policy={p} />)}
        </section>

        <section className="card">
          <h2>💳 지역 소비 특징</h2>
          <p className="muted small">외지인 카드 소비가 어떤 분야에 많이 쓰였는지 보여줘요.</p>
          <SpendingChart data={getSpending(id)} />
        </section>

        <section className="card span-2">
          <h2>🍽️ 맛집 · 명소</h2>
          <p className="muted small">장소는 실제 장소이며, 평점과 리뷰는 시연용 샘플입니다. <SampleBadge /></p>
          <PlaceList places={places} />
        </section>
      </div>

      <div className="cta-row">
        <Link to={`/community?region=${id}`} className="btn">{region.name} 처방 후기</Link>
        <Link to="/diagnosis" className="btn primary">🩺 1분 진단으로 처방받기</Link>
      </div>
    </div>
  );
}
