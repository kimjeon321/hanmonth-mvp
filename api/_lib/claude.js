// Claude API 공통 호출 함수 (서버에서만 실행됩니다)
// API 키는 Vercel 환경변수 ANTHROPIC_API_KEY에서 자동으로 읽습니다. 코드에 키를 적지 마세요.
// 파일 이름이 _로 시작하는 폴더는 Vercel이 API 주소로 만들지 않습니다.
import Anthropic from '@anthropic-ai/sdk';

// 모델은 Vercel 환경변수 CLAUDE_MODEL로 바꿀 수 있습니다. (예: claude-haiku-4-5)
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';

// 화면 쪽은 20초를 기다리므로 서버는 그보다 조금 짧게 끊습니다.
const client = new Anthropic({ timeout: 18000, maxRetries: 0 });

// JSON 스키마에 맞춘 답을 받아 객체로 돌려줍니다. 실패하면 예외를 던집니다.
export async function askJSON({ system, user, schema, maxTokens = 4000 }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다');
  }

  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: {
      effort: 'low', // 짧고 빠른 응답 (시연용)
      format: { type: 'json_schema', schema },
    },
  };

  let response;
  try {
    // 안전 필터가 요청을 거절하면 다른 모델로 자동 재시도하는 옵션을 켭니다.
    response = await client.beta.messages.create({
      ...params,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
  } catch (err) {
    // 위 옵션을 지원하지 않는 모델(예: Haiku)이면 옵션 없이 한 번 더 요청합니다.
    if (!(err instanceof Anthropic.BadRequestError)) throw err;
    response = await client.messages.create(params);
  }

  if (response.stop_reason === 'refusal') throw new Error('AI가 요청을 거절했습니다');
  if (response.stop_reason === 'max_tokens') throw new Error('AI 응답이 잘렸습니다');

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('AI 응답에 텍스트가 없습니다');
  return JSON.parse(textBlock.text);
}
