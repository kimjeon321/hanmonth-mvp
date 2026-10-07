// AI 없이 공고문에서 핵심 정보를 찾는 규칙 기반 추출기 (정규식 사용)
const NONE = '찾지 못함';

function firstMatch(text, regex, pick = (m) => m[0]) {
  const m = text.match(regex);
  return m ? pick(m).trim() : NONE;
}

// "키워드: 내용" 형태의 줄에서 내용을 찾습니다.
function lineAfter(text, keywords) {
  for (const line of text.split('\n')) {
    const m = line.match(new RegExp(`(?:${keywords.join('|')})\\s*[:：]?\\s*(.+)`));
    if (m && m[1].trim().length > 1) return m[1].trim();
  }
  return NONE;
}

export function extractPolicyByRules(text) {
  const firstLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0) || NONE;
  const dates = [...text.matchAll(/20\d{2}\s*[.\-년]\s*\d{1,2}\s*[.\-월]\s*\d{1,2}\s*일?/g)].map((m) => m[0]);

  return {
    // 맨 앞의 [공고] 같은 말머리는 빼고 사업명만 남깁니다.
    title: firstLine.replace(/^\s*[[【(][^\]】)]*[\]】)]\s*/, '').slice(0, 60),
    organizer: firstMatch(text, /[가-힣]+(?:특별자치도|광역시|도|시|군|구)청?(?=\s|$|[가-힣]*(?:에서|은|는))/),
    targetAge: firstMatch(text, /만?\s?\d{2}\s?세?\s?(?:~|-|부터|에서)\s?(?:만\s?)?\d{2}\s?세(?:\s?이하)?/),
    target: lineAfter(text, ['지원\\s?대상', '신청\\s?대상', '모집\\s?대상', '대상']),
    support: lineAfter(text, ['지원\\s?내용', '지원\\s?사항', '혜택']),
    amount: firstMatch(text, /(?:최대|1인당|1일|월)?\s?[\d,]+\s?(?:만\s?)?원(?:\s?(?:이내|한도|상당))?/),
    // "체류 기간: …" 같은 줄을 먼저 찾고, 없으면 "14일 ~ 30일" 같은 표현을 찾습니다.
    period: (() => {
      const line = lineAfter(text, ['체류\\s?기간', '지원\\s?기간', '활동\\s?기간', '참여\\s?기간']);
      if (line !== NONE) return line;
      return firstMatch(text, /\d+\s?(?:박\s?\d+\s?일|일|주|개월)\s?(?:~|-)\s?\d+\s?(?:일|주|개월)/);
    })(),
    deadline: dates.length ? dates[dates.length - 1] : NONE,
    howToApply: lineAfter(text, ['신청\\s?방법', '접수\\s?방법', '신청']),
    summary: '규칙 기반 추출 결과입니다. AI 모드에서는 문맥을 이해해 요약까지 작성합니다.',
  };
}
