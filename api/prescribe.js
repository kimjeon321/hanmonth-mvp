// POST /api/prescribe
// 진단 답변 + 한 줄 서술을 읽고 번아웃 유형을 판단한 뒤, 처방 문장을 작성합니다.
// 지역 순위와 점수는 브라우저에서 규칙으로 계산해 함께 보내 주므로, AI는 유형 판단과 글쓰기만 맡습니다.
import { askJSON } from './_lib/claude.js';

const TYPE_IDS = ['drained', 'overheated', 'isolated', 'stuck'];

const SYSTEM = `당신은 번아웃을 겪는 20~30대에게 지방 인구감소지역 '한 달 살기'를 처방하는 서비스의 상담가입니다.
사용자의 객관식 답변과 한 줄 서술을 읽고 네 가지 번아웃 유형 중 하나를 고른 뒤, 따뜻하고 구체적인 처방 문장을 씁니다.

유형:
- drained(방전형): 에너지가 바닥나 아무것도 하기 힘든 상태
- overheated(과열형): 일과 연락이 끊임없이 이어져 머리가 쉬지 못하는 상태
- isolated(고립형): 사람과의 연결이 줄어 외로움이 쌓인 상태
- stuck(정체형): 앞으로 무엇을 해야 할지 몰라 멈춘 상태

규칙:
- 규칙 기반 점수(typeScores)를 참고하되, 한 줄 서술이 다른 유형을 더 분명히 드러내면 그 유형을 고르세요. 바꿨다면 typeReason에 이유를 밝히세요.
- 고른 유형에 해당하는 후보(candidates)의 지역으로 처방합니다. 다른 지역 이름을 지어내지 마세요.
- 지원 정책과 금액은 후보에 적힌 것만 언급하세요. 없는 정책이나 숫자를 만들지 마세요.
- 정책의 모집 상태를 정확히 반영하세요. 마감되었거나 확인이 필요한 사업을 지금 바로 받을 수 있는 것처럼 쓰지 마세요.
- 취향 점수(topPrefs, score)는 시연용 샘플 데이터로 계산한 값입니다. "소비가 가장 많다" 같은 통계적 사실로 단정하지 마세요.
- 의학적 진단처럼 말하지 말고, 친구처럼 존댓말로 짧게 쓰세요.
- typeReason: 유형 판단 근거 1~2문장 (어떤 답변·표현을 근거로 했는지)
- textInsight: 한 줄 서술에서 읽어 낸 상태 1문장. 서술이 비어 있으면 빈 문자열
- message: 사용자에게 건네는 처방 메시지 2~3문장 (지역 이름 포함)
- reasons: 이 지역을 처방하는 이유 3개. 각각 한 문장, 사용자 답변과 지역 특징·지원 정책을 연결
- crisis: 서술에 자해·자살 등 위기 신호가 있으면 true`;

const SCHEMA = {
  type: 'object',
  properties: {
    typeId: { type: 'string', enum: TYPE_IDS },
    typeReason: { type: 'string' },
    textInsight: { type: 'string' },
    message: { type: 'string' },
    reasons: { type: 'array', items: { type: 'string' } },
    crisis: { type: 'boolean' },
  },
  required: ['typeId', 'typeReason', 'textInsight', 'message', 'reasons', 'crisis'],
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 지원합니다' });

  const { answers, freeText, ruleTypeId, typeScores, candidates } = req.body || {};
  if (!Array.isArray(answers) || !Array.isArray(candidates)) {
    return res.status(400).json({ error: '요청 형식이 올바르지 않습니다' });
  }

  const user = JSON.stringify({
    answers,
    freeText: String(freeText || '').slice(0, 200),
    ruleTypeId,
    typeScores,
    candidates,
  });

  try {
    const result = await askJSON({ system: SYSTEM, user, schema: SCHEMA });
    if (!TYPE_IDS.includes(result.typeId)) throw new Error('알 수 없는 유형');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[prescribe]', err.message);
    // 화면은 이 응답을 받으면 규칙 기반 결과로 자동 대체합니다.
    return res.status(503).json({ error: 'AI를 사용할 수 없습니다' });
  }
}
