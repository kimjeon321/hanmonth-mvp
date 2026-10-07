// 규칙 기반 진단·매칭 엔진
// AI가 없어도 이 파일만으로 처방전이 완성됩니다. (AI는 문장과 유형 판단을 보완하는 역할)
//
// 최종 매칭 점수 = 취향 점수 × 0.5 + 자격 조건 × 0.3 + 지역 필요도 × 0.2
//   - 취향 점수: 진단 답변으로 만든 선호도 ↔ 지역 소비 데이터·생활 지수
//   - 자격 조건: 내 나이·상황으로 받을 수 있는 지원 정책 비율
//   - 지역 필요도: 소멸위험 등급이 높을수록 높음
import { regions, policies, spending, burnoutTypes, questions, getBurnoutType, formatWon } from '../data';
import { withJosa } from './korean';

export const MATCH_WEIGHTS = { taste: 0.5, eligibility: 0.3, need: 0.2 };

export const PREF_LABELS = {
  food: '음식',
  nature: '자연',
  culture: '문화·교류',
  shopping: '쇼핑',
  cost: '저렴한 생활비',
  quiet: '조용함',
  work: '워케이션',
  activity: '레저·액티비티',
};

const PREF_REASONS = {
  food: '지역 소비에서 음식 비중이 높아 맛있는 밥으로 회복하기 좋아요',
  nature: '자연 관광 소비가 활발해 걷고 몸 쓰기 좋은 곳이에요',
  culture: '역사·문화 체험과 주민 교류 기회가 많아요',
  shopping: '쇼핑 인프라가 잘 갖춰져 있어요',
  cost: '한 달 생활비 부담이 적어요',
  quiet: '한적하고 조용해서 자극 없이 쉴 수 있어요',
  work: '일할 공간과 인터넷 환경이 갖춰져 워케이션에 좋아요',
  activity: '서핑·패러글라이딩 같은 레저로 몸을 쓰며 생각을 비울 수 있어요',
};

const LANDSCAPE_LABELS = { sea: '바다', mountain: '산과 강', village: '시골 마을' };

const CRISIS_PATTERN = /죽고\s?싶|자살|사라지고\s?싶|살기\s?싫|극단적|없어지고\s?싶/;

// ---------- 1. 답변 정리 ----------
// answers: 문항 순서대로 고른 보기의 번호 배열 (예: [1, 0, 2, ...])
export function summarizeAnswers(answers) {
  // 모든 항목 기본 가중치 0.5에서 시작해, 답변에 따라 더해집니다.
  const prefs = Object.fromEntries(Object.keys(PREF_LABELS).map((k) => [k, 0.5]));
  const typeScores = Object.fromEntries(burnoutTypes.map((t) => [t.id, 0]));
  const evidence = []; // 유형 판단 근거
  const picked = [];
  let age = 30;
  let group = '직장인';
  let landscape = null;

  questions.forEach((q, i) => {
    const option = q.options[answers[i]];
    if (!option) return;
    picked.push({ question: q.title, answer: option.label });
    if (option.age) age = option.age;
    if (option.group) group = option.group;
    if (option.landscape !== undefined) landscape = option.landscape;
    for (const [key, v] of Object.entries(option.pref || {})) prefs[key] += v;
    for (const [typeId, v] of Object.entries(option.type || {})) {
      typeScores[typeId] += v;
      evidence.push({ typeId, points: v, text: `"${q.title}" → ${option.label}` });
    }
  });

  return { picked, age, group, landscape, prefs, typeScores, evidence };
}

// ---------- 2. 자유 서술 분석 (규칙 기반: 키워드) ----------
export function analyzeText(text = '') {
  const found = [];
  const scores = {};
  for (const t of burnoutTypes) {
    const hits = t.keywords.filter((k) => text.includes(k));
    scores[t.id] = hits.length * 2;
    if (hits.length) found.push({ typeId: t.id, keywords: hits });
  }
  return { scores, found, crisis: CRISIS_PATTERN.test(text) };
}

export function decideType(summary, textAnalysis) {
  const total = {};
  for (const t of burnoutTypes) {
    total[t.id] = summary.typeScores[t.id] + (textAnalysis.scores[t.id] || 0);
  }
  const typeId = Object.entries(total).sort((a, b) => b[1] - a[1])[0][0];
  return { typeId, scores: total };
}

// ---------- 3. 지역 매칭 ----------
// 항목별 원래 값(소비 비율, 생활 지수)을 지역끼리 비교해 40~100점으로 환산합니다.
// (가장 낮은 지역 40점, 가장 높은 지역 100점 → 지역 간 차이가 점수에 잘 드러납니다)
function rawValue(region, key) {
  if (key in spending.categories) return spending.regions[region.id][key];
  return {
    cost: region.costScore,
    quiet: region.quietScore,
    work: region.workScore,
    activity: region.activityScore,
  }[key];
}

function regionCategoryScores(region) {
  const scores = {};
  for (const key of Object.keys(PREF_LABELS)) {
    const values = regions.map((r) => rawValue(r, key));
    const min = Math.min(...values);
    const max = Math.max(...values);
    scores[key] = max === min ? 70 : Math.round(40 + (60 * (rawValue(region, key) - min)) / (max - min));
  }
  return scores;
}

// 지역 필요도(1~4, 시연용 샘플 값)를 점수로: 4 → 100, 3 → 85, 2 → 70, 1 → 55
// 실제 서비스에서는 소멸위험지수(통계청 KOSIS)로 계산합니다.
const needScore = (needLevel) => 40 + needLevel * 15;

// 같은 사업의 일반/청년 지원처럼 중복으로 못 받는 정책은 가장 큰 금액 하나만 더합니다.
function sumSupport(eligible) {
  const best = {};
  for (const p of eligible) {
    const key = p.exclusiveGroup || p.id;
    best[key] = Math.max(best[key] || 0, p.amountValue);
  }
  return Object.values(best).reduce((s, v) => s + v, 0);
}

export function eligiblePolicies(regionId, age, group) {
  return policies.filter(
    (p) =>
      p.regionId === regionId &&
      age >= p.ageMin &&
      age <= p.ageMax &&
      (p.targetGroups.includes('누구나') || p.targetGroups.includes(group)),
  );
}

export function rankRegions(summary, typeId) {
  const type = getBurnoutType(typeId);
  const weights = { ...summary.prefs };
  for (const [key, v] of Object.entries(type.prefBoost)) weights[key] += v;
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);

  return regions
    .map((region) => {
      const cat = regionCategoryScores(region);
      const contributions = Object.keys(weights).map((key) => ({
        key,
        label: PREF_LABELS[key],
        score: cat[key],
        value: cat[key] * weights[key],
      }));
      let taste = contributions.reduce((s, c) => s + c.value, 0) / weightSum;
      const landscapeMatch = Boolean(summary.landscape && region.landscape.includes(summary.landscape));
      if (landscapeMatch) taste = Math.min(100, taste + 10);
      taste = Math.round(taste);

      const all = policies.filter((p) => p.regionId === region.id);
      const eligible = eligiblePolicies(region.id, summary.age, summary.group);
      const eligibility = all.length ? Math.round((eligible.length / all.length) * 100) : 0;
      const need = needScore(region.population.needLevel);

      const total = Math.round(
        taste * MATCH_WEIGHTS.taste + eligibility * MATCH_WEIGHTS.eligibility + need * MATCH_WEIGHTS.need,
      );

      return {
        regionId: region.id,
        total,
        taste,
        eligibility,
        need,
        landscapeMatch,
        topPrefs: [...contributions].sort((a, b) => b.value - a.value).slice(0, 2),
        eligibleIds: eligible.map((p) => p.id),
        supportTotal: sumSupport(eligible),
        openCount: eligible.filter((p) => p.isOpen).length,
      };
    })
    .sort((a, b) => b.total - a.total);
}

// ---------- 4. 처방 문장 (템플릿) ----------
export function ruleReasons(match, summary) {
  const region = regions.find((r) => r.id === match.regionId);
  const reasons = match.topPrefs.map((p) => `${PREF_REASONS[p.key]} (${p.label} ${p.score}점 · 샘플 데이터 기준)`);
  if (match.landscapeMatch) {
    reasons.push(`원하신 '${LANDSCAPE_LABELS[summary.landscape]}' 풍경을 매일 볼 수 있어요`);
  }
  if (match.eligibleIds.length) {
    const money = match.supportTotal ? `, 최근 공고 기준 최대 ${formatWon(match.supportTotal)}` : '';
    const open = match.openCount ? ` (지금 신청 가능 ${match.openCount}건)` : ' (다음 모집을 확인해야 해요)';
    reasons.push(
      `만 ${summary.age}세 ${withJosa(summary.group, '으로', '로')} 지원 사업 ${match.eligibleIds.length}건 대상이에요${money}${open}`,
    );
  }
  reasons.push(
    `${withJosa(region.name, '은', '는')} 행정안전부가 지정한 인구감소지역이라 당신의 한 달이 지역에 힘이 돼요`,
  );
  return reasons.slice(0, 4);
}

export function ruleMessage(typeId, regionId) {
  const region = regions.find((r) => r.id === regionId);
  return getBurnoutType(typeId).template.replace('{region}', region.name);
}

// ---------- 5. 전체 처방전 (규칙 기반) ----------
export function buildRulePrescription(answers, freeText) {
  const summary = summarizeAnswers(answers);
  const text = analyzeText(freeText);
  const { typeId, scores } = decideType(summary, text);
  const ranking = rankRegions(summary, typeId);
  const top = ranking[0];
  const type = getBurnoutType(typeId);

  return {
    mode: 'rule',
    createdAt: new Date().toISOString(),
    freeText,
    summary,
    typeId,
    typeScores: scores,
    textKeywords: text.found,
    typeReason: `답변 중 ${type.name} 신호가 가장 많았어요 (${scores[typeId]}점).`,
    textInsight: text.found.length
      ? `한 줄 서술에서 ${text.found.map((f) => `'${f.keywords.join("', '")}'`).join(', ')} 같은 표현을 찾았어요.`
      : null,
    ranking,
    message: ruleMessage(typeId, top.regionId),
    reasons: ruleReasons(top, summary),
    crisis: text.crisis,
  };
}
