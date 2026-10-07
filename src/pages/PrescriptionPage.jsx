import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { burnoutTypes, getBurnoutType, getRegion, getPolicies, formatWon } from '../data';
import { loadPrescription } from '../utils/prescriptionStorage';
import { MATCH_WEIGHTS } from '../utils/matching';
import { withJosa } from '../utils/korean';
import PrescriptionCard from '../components/PrescriptionCard';
import PolicyCard from '../components/PolicyCard';
import CrisisBanner from '../components/CrisisBanner';
import { ModeBadge, SampleBadge } from '../components/Badges';

export default function PrescriptionPage() {
  const [result] = useState(loadPrescription);
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  if (!result) {
    return (
      <div className="page narrow center">
        <h1>아직 처방전이 없어요</h1>
        <p className="muted">1분 진단을 하면 나만의 한 달 살기 처방전을 받을 수 있어요.</p>
        <Link to="/diagnosis" className="btn primary big">🩺 1분 진단 시작</Link>
      </div>
    );
  }

  const type = getBurnoutType(result.typeId);
  const top = result.ranking[0];
  const region = getRegion(top.regionId);
  const regionPolicies = getPolicies(region.id);
  const maxTypeScore = Math.max(...Object.values(result.typeScores), 1);
  const date = new Date(result.createdAt).toLocaleDateString('ko-KR');

  const saveImage = async () => {
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const el = cardRef.current;
      const canvas = await html2canvas(el, { scale: 1080 / el.offsetWidth, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `한달살이-처방전-${region.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('이미지 저장에 실패했어요. 화면을 캡처해 주세요.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page rx-page">
      {result.crisis && <CrisisBanner />}

      <div className="rx-header">
        <h1>나의 한 달 살기 처방전</h1>
        <ModeBadge mode={result.mode} />
      </div>

      <div className="rx-layout">
        {/* ---------- 왼쪽: 공유용 카드 ---------- */}
        <div className="rx-card-col">
          <PrescriptionCard ref={cardRef} type={type} region={region} match={top} date={date} />
          <button className="btn primary block" onClick={saveImage} disabled={saving}>
            {saving ? '저장 중…' : '📸 처방전 이미지 저장 (스토리용)'}
          </button>
        </div>

        {/* ---------- 오른쪽: 상세 ---------- */}
        <div className="rx-detail">
          <section className="card">
            <p className="section-eyebrow">처방 이유</p>
            <h2>
              {type.emoji} {type.name}인 당신에게 {region.emoji} {withJosa(region.name, '을', '를')} 처방합니다
            </h2>
            <p className="rx-message">{result.message}</p>
            <ul className="check-list">
              {result.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </section>

          <section className="card gov">
            <p className="section-eyebrow">이 처방, 정부·지자체 지원 사업과 함께</p>
            <h2>
              {top.eligibleIds.length === 0 ? (
                '지금 자격으로 대상이 되는 사업을 찾지 못했어요'
              ) : top.supportTotal ? (
                <>최근 공고 기준 최대 <span className="accent">{formatWon(top.supportTotal)}</span></>
              ) : (
                <>대상 사업 {top.eligibleIds.length}건</>
              )}
            </h2>
            <p className="muted small">
              만 {result.summary.age}세 · {result.summary.group} 기준으로 자격을 확인했어요. 지금 신청 가능한 사업은{' '}
              <strong>{top.openCount}건</strong>이고, 나머지는 다음 모집을 확인해야 해요. 실제 신청 전 각 공고 원문을
              꼭 확인하세요.
            </p>
            {regionPolicies.map((p) => (
              <PolicyCard key={p.id} policy={p} eligible={top.eligibleIds.includes(p.id)} />
            ))}
          </section>

          <section className="card living">
            <p className="section-eyebrow">당신의 한 달이 이 지역의 생활인구가 됩니다</p>
            <div className="living-row">
              <div>
                <span className="risk-tag">인구감소지역</span>
                <h2>{region.province} {region.name}</h2>
                <p className="small">
                  {region.population.designation}. 월 1회, 하루 3시간 이상 머무는 사람도 이 지역의 생활인구로
                  집계돼요.
                </p>
              </div>
              <div className="living-impact">
                <strong>+1명</strong>
                <span className="small">생활인구</span>
                <strong>+{formatWon(region.monthlyCost)}</strong>
                <span className="small">예상 지역 소비 <SampleBadge label="추정" /></span>
              </div>
            </div>
          </section>

          {/* ---------- 체류 이후 다음 단계 ---------- */}
          <section className="card next-steps">
            <p className="section-eyebrow">한 달 이후, 다음 단계</p>
            <h2>쉼으로 시작해, 원하면 더 머물 수 있어요</h2>
            <ol className="next-list">
              <li className="done">
                <span className="next-key">쉼</span>
                <div>
                  <strong>처방 받기</strong>
                  <p className="small muted">지금 이 단계예요. {region.name}에서 회복의 한 달을 시작해 보세요.</p>
                </div>
              </li>
              <li>
                <span className="next-key">체류</span>
                <div>
                  <strong>한 달 머물기</strong>
                  <p className="small muted">위 지원 사업으로 숙박비·체험비 부담을 덜고, 이 지역의 생활인구가 돼요.</p>
                </div>
              </li>
              <li>
                <span className="next-key">관계</span>
                <div>
                  <strong>후기 남기고 다시 찾기</strong>
                  <p className="small muted">
                    <Link to="/community" className="underline">처방 후기</Link>로 경험을 나누면, 다음 사람의 처방이
                    더 정확해져요.
                  </p>
                </div>
              </li>
              <li>
                <span className="next-key">정착</span>
                <div>
                  <strong>더 살아 보고 싶다면</strong>
                  <p className="small muted">
                    청년마을·주거 지원 같은 {region.province} 정착 정책으로 연결해 드릴 예정이에요.{' '}
                    <SampleBadge label="2단계 예정" />
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* ---------- AI 판단 근거 ---------- */}
          <section className="card ai-panel">
            <p className="section-eyebrow">{result.mode === 'ai' ? 'AI가 이렇게 판단했어요' : '이렇게 판단했어요'}</p>

            <h3>① 번아웃 유형 판단</h3>
            <p>{result.typeReason}</p>
            {result.textInsight && <p className="insight">💬 {result.textInsight}</p>}
            {result.mode === 'ai' && result.ruleTypeId && result.ruleTypeId !== result.typeId && (
              <p className="small muted">
                객관식 답변만 보면 {getBurnoutType(result.ruleTypeId).name}이었지만, 한 줄 서술을 반영해
                {' '}{getBurnoutType(result.typeId).name}으로 판단했어요.
              </p>
            )}
            <div className="type-bars">
              {burnoutTypes.map((t) => (
                <div key={t.id} className={`type-bar ${t.id === result.typeId ? 'active' : ''}`}>
                  <span>{t.emoji} {t.name}</span>
                  <div className="bar"><div style={{ width: `${(result.typeScores[t.id] / maxTypeScore) * 100}%` }} /></div>
                  <span className="num">{result.typeScores[t.id]}</span>
                </div>
              ))}
            </div>
            <p className="muted small">답변별 유형 점수 + 한 줄 서술 키워드 점수의 합</p>

            <h3>② 매칭 점수 구성</h3>
            <p className="formula-line">
              취향 {top.taste} × {MATCH_WEIGHTS.taste} + 자격 조건 {top.eligibility} × {MATCH_WEIGHTS.eligibility} + 지역
              필요도 {top.need} × {MATCH_WEIGHTS.need} = <strong>{top.total}점</strong>
            </p>
            <div className="table-wrap">
              <table className="score-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>지역</th>
                    <th>취향 <small>×{MATCH_WEIGHTS.taste}</small></th>
                    <th>자격 <small>×{MATCH_WEIGHTS.eligibility}</small></th>
                    <th>필요도 <small>×{MATCH_WEIGHTS.need}</small></th>
                    <th>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ranking.map((m, i) => {
                    const r = getRegion(m.regionId);
                    return (
                      <tr key={m.regionId} className={i === 0 ? 'top' : ''}>
                        <td>{i + 1}</td>
                        <td><Link to={`/region/${r.id}`}>{r.emoji} {r.name}</Link></td>
                        <td>{m.taste}</td>
                        <td>{m.eligibility}</td>
                        <td>{m.need}</td>
                        <td><strong>{m.total}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="muted small legend-list">
              <li><strong>취향</strong>: 진단 답변 + 유형별 처방 방향 ↔ 지역 카드 소비 데이터·생활 지수 <SampleBadge /></li>
              <li><strong>자격 조건</strong>: 지역 지원 정책 중 내 나이·상황으로 받을 수 있는 비율</li>
              <li><strong>지역 필요도</strong>: 사람이 더 필요한 곳일수록 높음. 현재는 샘플 값이며, 실제 서비스에서는 소멸위험지수(통계청 KOSIS)로 계산 <SampleBadge /></li>
            </ul>
          </section>

          <div className="cta-row">
            <Link to={`/region/${region.id}`} className="btn primary">{region.name} 자세히 보기</Link>
            <Link to="/community" className="btn">처방 후기 보기</Link>
            <Link to="/diagnosis" className="btn">다시 진단하기</Link>
          </div>
          <p className="muted small center">
            이 처방전은 의학적 진단이 아닙니다. 지원 사업은 공개된 기사·공고를 바탕으로 2026년 10월 7일에 정리했으며, 실제
            내용과 모집 일정은 각 공고 원문을 확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
