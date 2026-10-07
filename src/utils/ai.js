// AI 호출 + 자동 대체(fallback)
// /api/... 서버 함수가 없거나(로컬 개발), 키가 없거나, 실패·시간 초과되면
// 규칙 기반 결과를 그대로 돌려줍니다. → 시연 중 화면이 멈추지 않습니다.
import { burnoutTypes, getRegion, getBurnoutType, policies } from '../data';
import { buildRulePrescription, rankRegions, ruleReasons } from './matching';
import { extractPolicyByRules } from './extractFallback';

const AI_TIMEOUT_MS = 20000;

async function postJSON(url, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- 처방전 ----------
export async function getPrescription(answers, freeText) {
  const rule = buildRulePrescription(answers, freeText);

  try {
    // 유형별로 1위 지역을 미리 계산해 AI에게 후보로 넘깁니다.
    // AI가 유형을 바꾸더라도 지역·점수는 항상 규칙으로 계산되어 설명할 수 있습니다.
    const candidates = burnoutTypes.map((t) => {
      const top = rankRegions(rule.summary, t.id)[0];
      const region = getRegion(top.regionId);
      return {
        typeId: t.id,
        typeName: t.name,
        typeSummary: t.summary,
        region: region.name,
        regionDescription: region.description,
        designation: region.population.designation,
        score: { total: top.total, taste: top.taste, eligibility: top.eligibility, need: top.need },
        topPrefs: top.topPrefs.map((p) => p.label),
        eligiblePolicies: policies
          .filter((p) => top.eligibleIds.includes(p.id))
          .map((p) => `${p.title} (${p.amount} / 모집 상태: ${p.status})`),
      };
    });

    const ai = await postJSON('/api/prescribe', {
      answers: rule.summary.picked,
      freeText,
      ruleTypeId: rule.typeId,
      typeScores: rule.typeScores,
      candidates,
    });

    if (!getBurnoutType(ai.typeId) || !ai.message || !Array.isArray(ai.reasons)) {
      throw new Error('AI 응답 형식 오류');
    }

    const ranking = rankRegions(rule.summary, ai.typeId);
    return {
      ...rule,
      mode: 'ai',
      typeId: ai.typeId,
      ruleTypeId: rule.typeId,
      ranking,
      typeReason: ai.typeReason,
      textInsight: ai.textInsight || rule.textInsight,
      message: ai.message,
      reasons: ai.reasons.length ? ai.reasons.slice(0, 4) : ruleReasons(ranking[0], rule.summary),
      crisis: rule.crisis || Boolean(ai.crisis),
    };
  } catch (err) {
    console.info('[기본 분석 모드]', err.message);
    return rule;
  }
}

// ---------- 지자체 공고문 추출 ----------
export async function extractPolicy(text) {
  try {
    const ai = await postJSON('/api/extract-policy', { text });
    if (!ai || typeof ai.title !== 'string') throw new Error('AI 응답 형식 오류');
    return { mode: 'ai', fields: ai };
  } catch (err) {
    console.info('[기본 분석 모드]', err.message);
    return { mode: 'rule', fields: extractPolicyByRules(text) };
  }
}
