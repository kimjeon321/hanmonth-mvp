import { Link } from 'react-router-dom';
import { stats, regions } from '../data';
import { getConnectedCount } from '../utils/prescriptionStorage';
import ExtinctionGrid from '../components/ExtinctionGrid';
import CountUp from '../components/CountUp';
import { SampleBadge } from '../components/Badges';

const COMPARISON = [
  { item: '정부·지자체 지원 정책 통합', old: '지자체마다 따로 공고', ours: '한 곳에서 자격 자동 확인' },
  { item: '나의 상태 진단', old: '없음', ours: '번아웃 유형 진단 + 한 줄 서술 AI 분석' },
  { item: '지역 추천 기준', old: '인기·광고 순위', ours: '취향 + 자격 조건 + 지역 필요도' },
  { item: '추천 이유 설명', old: '없음', ours: '점수 구성까지 공개' },
  { item: '지역(지자체) 입장', old: '공고만 올리고 끝', ours: '공고문 → AI 구조화 → 맞는 청년에게 자동 매칭' },
];

const EFFECTS = [
  { icon: '🧑‍💼', who: '2030 청년', text: '내 상태에 맞는 회복의 한 달을, 지원금과 함께 찾아요.' },
  { icon: '🏘️', who: '인구감소지역', text: '머무는 사람이 늘어 생활인구와 지역 소비가 늘어요.' },
  { icon: '🏛️', who: '정부·지자체', text: '흩어진 정책이 필요한 사람에게 정확히 닿아요.' },
];

const ROADMAP = [
  { step: '1단계 · 지금', title: 'MVP', text: '번아웃 진단, AI 처방, 인구감소지역 4곳, 지자체 공고 구조화 데모' },
  { step: '2단계', title: '데이터 연결', text: 'TourAPI·관광 소비 통계·지자체 공고 자동 수집으로 89개 인구감소지역 확대' },
  { step: '3단계', title: '정착까지', text: '생활인구 통계 연동, 체류 후 귀촌·지역 일자리·두 지역 살기로 연결' },
];

export default function HomePage() {
  const connected = getConnectedCount();
  const { extinction, decliningAreas, livingPopulation } = stats;

  return (
    <div className="home">
      {/* ---------- 히어로 ---------- */}
      <section className="hero-main">
        <p className="eyebrow">쉼이 필요한 2030 × 사람이 필요한 지방</p>
        <h1>
          번아웃엔 퇴사 말고,<br />
          <span className="accent">한 달 살기 처방</span>을.
        </h1>
        <p className="hero-sub">
          1분 진단으로 내 번아웃 유형을 알아보고,<br className="br-mobile" />
          정부 지원을 받아 회복할 지역을 처방받으세요.
        </p>
        <Link to="/diagnosis" className="btn primary big">🩺 1분 진단 시작</Link>
        <p className="small hero-note">
          지금까지 <strong><CountUp to={connected} />명</strong>이 지역의 생활인구가 되었어요 <SampleBadge />
        </p>
      </section>

      <div className="page">
        {/* ---------- 왜 만들었나 ---------- */}
        <section className="section">
          <p className="section-eyebrow">왜 만들었나</p>
          <h2 className="section-title">지방은 사람이 필요하고, 2030은 쉼이 필요합니다</h2>

          <div className="why-grid">
            <article className="card why-card">
              <p className="why-num">
                <strong>{extinction.percent}%</strong>
              </p>
              <h3>전국 {extinction.total}개 시군구 중 {extinction.atRisk}곳이 소멸위험</h3>
              <ExtinctionGrid total={extinction.total} atRisk={extinction.atRisk} />
              <p className="muted small">
                출처:{' '}
                <a href={extinction.url} target="_blank" rel="noreferrer" className="underline">
                  {extinction.source}
                </a>
              </p>
            </article>

            <article className="card why-card">
              <p className="why-num"><strong>생활인구</strong></p>
              <h3>살지 않아도, 머물면 지역의 인구가 됩니다</h3>
              <div className="formula">
                <div className="f-box">주민등록인구</div>
                <span className="f-op">+</span>
                <div className="f-box accent">체류인구<small>월 1회 · 3시간 이상</small></div>
                <span className="f-op">=</span>
                <div className="f-box strong">생활인구</div>
              </div>
              <p className="small">
                정부는 {decliningAreas.count}곳을 인구감소지역으로 지정하고, 이주가 아니어도 <strong>머무는 사람</strong>을
                늘리는 정책을 펼치고 있어요. 한 달 살기는 가장 확실한 체류 방법입니다.
              </p>
              <p className="muted small">출처: {livingPopulation.source}, {decliningAreas.source}</p>
            </article>

            <article className="card why-card">
              <p className="why-num"><strong>정보 단절</strong></p>
              <h3>지원은 있는데, 2030에게 닿지 않아요</h3>
              <div className="flow">
                <div className="flow-col">
                  <span className="chip-s">A군 홈페이지 공고</span>
                  <span className="chip-s">B도 보도자료</span>
                  <span className="chip-s">C시 SNS 모집</span>
                </div>
                <span className="flow-arrow">→ ❓ →</span>
                <div className="flow-col">
                  <span className="chip-s muted-chip">"그런 게 있었어?"</span>
                </div>
              </div>
              <p className="small">
                정책은 지자체마다 흩어져 있고, 내가 대상인지 알기 어려워요. 한달살이는 이 정책들을 모아{' '}
                <strong>내 상태와 자격에 맞게 처방</strong>합니다.
              </p>
            </article>
          </div>
        </section>

        {/* ---------- 기존 서비스와의 차이 ---------- */}
        <section className="section">
          <p className="section-eyebrow">기존 서비스와의 차이</p>
          <h2 className="section-title">여행 추천이 아니라, 사람과 지역을 연결하는 처방</h2>
          <div className="card table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>기존 (지자체 공고 · 여행 플랫폼 · 카페)</th>
                  <th className="ours">한달살이</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td className="muted">{row.old}</td>
                    <td className="ours">✓ {row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- 기대효과·확장 계획 ---------- */}
        <section className="section">
          <p className="section-eyebrow">기대효과 · 확장 계획</p>
          <h2 className="section-title">한 사람의 한 달이 지역을 바꿉니다</h2>

          <div className="counter-band">
            <div>
              <span className="small">생활인구 연결</span>
              <strong><CountUp to={connected} />명</strong>
            </div>
            <div>
              <span className="small">지역 체류일</span>
              <strong><CountUp to={connected * 30} />일</strong>
            </div>
            <div>
              <span className="small">예상 지역 소비</span>
              <strong>
                약 <CountUp to={Math.round((connected * 115) / 10000)} />억 원
              </strong>
            </div>
          </div>
          <p className="muted small center">
            {stats.counter.note} · 1인 한 달 지역 소비 약 115만 원 가정 <SampleBadge />
          </p>

          <div className="effect-grid">
            {EFFECTS.map((e) => (
              <div key={e.who} className="card effect">
                <span className="effect-icon">{e.icon}</span>
                <strong>{e.who}</strong>
                <p className="small">{e.text}</p>
              </div>
            ))}
          </div>

          <ol className="roadmap">
            {ROADMAP.map((r) => (
              <li key={r.step} className="card">
                <span className="tag">{r.step}</span>
                <h3>{r.title}</h3>
                <p className="small">{r.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- 처방 가능 지역 ---------- */}
        <section className="section center">
          <h2 className="section-title">지금 처방 가능한 인구감소지역</h2>
          <div className="chips center-chips">
            {regions.map((r) => (
              <Link key={r.id} to={`/region/${r.id}`} className="chip">
                {r.emoji} {r.name}
              </Link>
            ))}
          </div>
          <Link to="/diagnosis" className="btn primary big">나에게 맞는 지역 처방받기</Link>
        </section>
      </div>
    </div>
  );
}
