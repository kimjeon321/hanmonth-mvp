import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data';
import { getPrescription } from '../utils/ai';
import { savePrescription } from '../utils/prescriptionStorage';

const LOADING_STEPS = [
  '답변에서 번아웃 신호를 찾고 있어요',
  '한 줄 서술을 읽고 있어요',
  '받을 수 있는 지원 정책을 확인하고 있어요',
  '지역 필요도를 반영해 처방전을 쓰고 있어요',
];

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 ~ questions.length (마지막은 자유 서술)
  const [answers, setAnswers] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const total = questions.length + 1;
  const isTextStep = step === questions.length;

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1500);
    return () => clearInterval(timer);
  }, [loading]);

  const choose = (index) => {
    const next = [...answers];
    next[step] = index;
    setAnswers(next);
    setStep(step + 1);
  };

  const submit = async () => {
    setLoading(true);
    // 결과가 바로 나와도 분석 과정을 볼 수 있게 최소 3초는 보여 줍니다.
    const wait = new Promise((resolve) => setTimeout(resolve, 3000));
    const [result] = await Promise.all([getPrescription(answers, freeText.trim()), wait]);
    savePrescription(result);
    navigate('/prescription');
  };

  if (loading) {
    return (
      <div className="page narrow center loading-screen">
        <div className="pulse">🩺</div>
        <h2>처방전을 쓰고 있어요</h2>
        <ul className="loading-steps">
          {LOADING_STEPS.map((s, i) => (
            <li key={s} className={i <= loadingStep ? 'done' : ''}>
              {i < loadingStep ? '✓' : i === loadingStep ? '…' : '·'} {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const q = questions[step];

  return (
    <div className="page narrow">
      <div className="progress" aria-label={`${total}단계 중 ${step + 1}단계`}>
        <div style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <p className="muted small">
        {step + 1} / {total}
      </p>

      {!isTextStep ? (
        <section className="question" key={q.id}>
          <h1>{q.title}</h1>
          {q.hint && <p className="muted">{q.hint}</p>}
          <div className="options">
            {q.options.map((o, i) => (
              <button
                key={o.label}
                className={`option ${answers[step] === i ? 'selected' : ''}`}
                onClick={() => choose(i)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="question">
          <h1>요즘 상태를 한 줄로 써주세요</h1>
          <p className="muted">솔직하게 써 주실수록 처방이 정확해져요. (선택)</p>
          <textarea
            className="free-text"
            rows={3}
            maxLength={100}
            value={freeText}
            placeholder="예) 퇴근하고 나면 아무것도 못 하겠고, 주말엔 핸드폰만 보다가 끝나요"
            onChange={(e) => setFreeText(e.target.value)}
          />
          <p className="muted small right">{freeText.length} / 100</p>
          <button className="btn primary block big" onClick={submit}>
            🩺 처방전 받기
          </button>
          <p className="muted small center">
            입력한 내용은 처방전을 만드는 데만 사용되며, 의학적 진단이 아닙니다.
          </p>
        </section>
      )}

      {step > 0 && (
        <button className="link-btn" onClick={() => setStep(step - 1)}>
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
