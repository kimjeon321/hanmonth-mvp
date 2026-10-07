// POST /api/extract-policy
// 지자체 정책 공고문 텍스트에서 핵심 항목을 뽑아 표로 만들 수 있는 JSON으로 돌려줍니다.
import { askJSON } from './_lib/claude.js';

const FIELDS = ['title', 'organizer', 'targetAge', 'target', 'support', 'amount', 'period', 'deadline', 'howToApply', 'summary'];

const SYSTEM = `당신은 지자체의 '한 달 살기'·청년 지원 정책 공고문을 구조화하는 도우미입니다.
공고문에서 아래 항목을 찾아 한국어로 간결하게 정리하세요. 공고문에 없는 내용은 지어내지 말고 "찾지 못함"이라고 쓰세요.
- title: 사업명
- organizer: 주관 기관
- targetAge: 대상 연령 (예: 만 19~39세)
- target: 지원 대상 (연령 외 조건 포함)
- support: 지원 내용
- amount: 지원 금액 (최대 금액 위주)
- period: 체류·지원 기간
- deadline: 신청 마감일
- howToApply: 신청 방법
- summary: 2030 청년이 읽기 쉬운 한 문장 요약`;

const SCHEMA = {
  type: 'object',
  properties: Object.fromEntries(FIELDS.map((f) => [f, { type: 'string' }])),
  required: FIELDS,
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 지원합니다' });

  const text = String(req.body?.text || '').trim();
  if (text.length < 10) return res.status(400).json({ error: '공고문이 너무 짧습니다' });

  try {
    const result = await askJSON({
      system: SYSTEM,
      user: `다음 공고문을 정리해 주세요.\n\n<공고문>\n${text.slice(0, 6000)}\n</공고문>`,
      schema: SCHEMA,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[extract-policy]', err.message);
    return res.status(503).json({ error: 'AI를 사용할 수 없습니다' });
  }
}
