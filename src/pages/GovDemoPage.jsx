import { useState } from 'react';
import { extractPolicy } from '../utils/ai';
import { ModeBadge, SampleBadge } from '../components/Badges';

const SAMPLE_NOTICE = `[공고] 2026년 하반기 「단양에서 한 달 살아보기」 참가자 모집

단양군에서는 생활인구 확대와 지역 활력 제고를 위해 다음과 같이 한 달 살기 참가자를 모집합니다.

1. 지원 대상: 단양군 외 지역에 주민등록을 둔 만 19세~39세 청년 (개인 또는 2인 팀)
2. 지원 내용: 숙박비 및 레저 체험비 지원, 지역 청년 네트워킹 프로그램 참여
3. 지원 금액: 1인당 최대 60만 원 (숙박비 1일 2만 원, 체험비 최대 20만 원)
4. 체류 기간: 14일 ~ 30일 (2026년 11월 1일 ~ 12월 20일 중)
5. 모집 기간: 2026. 10. 13.(월) ~ 2026. 10. 31.(금) 18:00까지
6. 신청 방법: 단양군청 누리집 공고란에서 신청서 내려받아 이메일 제출
7. 참가 조건: 체류 기간 중 SNS 후기 3건 이상 게시, 레저 체험 2회 이상 참여

문의: 단양군청 인구정책팀`;

const FIELD_LABELS = [
  ['title', '사업명'],
  ['organizer', '주관 기관'],
  ['targetAge', '대상 연령'],
  ['target', '지원 대상'],
  ['support', '지원 내용'],
  ['amount', '지원 금액'],
  ['period', '기간'],
  ['deadline', '신청 마감'],
  ['howToApply', '신청 방법'],
  ['summary', '한 줄 요약'],
];

export default function GovDemoPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (text.trim().length < 10) return;
    setLoading(true);
    setResult(null);
    setResult(await extractPolicy(text));
    setLoading(false);
  };

  return (
    <div className="page narrow">
      <p className="section-eyebrow">지자체 담당자용 데모</p>
      <h1>🏛️ 공고문을 붙여넣으면, 바로 매칭 가능한 정책이 됩니다</h1>
      <p className="muted">
        지자체마다 형식이 다른 공고문을 AI가 읽고 대상·금액·기간·마감일을 표로 정리합니다. 정리된 정책은 진단 결과와
        자동으로 연결되어, 자격이 맞는 2030에게 처방됩니다.
      </p>

      <div className="card form">
        <label>
          정책 공고문
          <textarea
            rows={10}
            value={text}
            placeholder="공고문 내용을 그대로 붙여넣어 주세요"
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="row-btns">
          <button className="btn" onClick={() => setText(SAMPLE_NOTICE)}>
            📄 샘플 공고문 넣기
          </button>
          <button className="btn primary" onClick={run} disabled={loading || text.trim().length < 10}>
            {loading ? '분석 중…' : '✨ AI로 정리하기'}
          </button>
        </div>
        <p className="muted small">
          샘플 공고문은 시연용으로 만든 가상의 공고입니다. <SampleBadge />
        </p>
      </div>

      {loading && (
        <div className="card center">
          <div className="pulse small-pulse">📑</div>
          <p>공고문을 읽고 핵심 항목을 찾고 있어요…</p>
        </div>
      )}

      {result && (
        <section className="card">
          <div className="rx-header">
            <h2>추출 결과</h2>
            <ModeBadge mode={result.mode} />
          </div>
          <table className="extract-table">
            <tbody>
              {FIELD_LABELS.map(([key, label]) => (
                <tr key={key}>
                  <th>{label}</th>
                  <td className={result.fields[key] === '찾지 못함' ? 'muted' : ''}>{result.fields[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="next-step">
            <strong>➜ 등록하면 이렇게 연결돼요</strong>
            <p className="small">
              진단에서 <b>{result.fields.targetAge !== '찾지 못함' ? result.fields.targetAge : '대상 연령'}</b>에 해당하는
              사용자가 이 지역을 처방받으면, 처방전의 "정부·지자체 지원 사업"에 이 정책이 출처와 함께 자동으로 표시됩니다.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
