// 마지막 처방전과 "생활인구 연결 카운터"를 브라우저에 저장합니다.
import { stats } from '../data';

const LAST_KEY = 'hanmonth-last-prescription';
const COUNT_KEY = 'hanmonth-prescription-count';

export function savePrescription(result) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(result));
    localStorage.setItem(COUNT_KEY, String(getLocalCount() + 1));
  } catch {
    // 저장이 막힌 환경에서도 화면은 동작합니다.
  }
}

export function loadPrescription() {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY));
  } catch {
    return null;
  }
}

function getLocalCount() {
  try {
    return Number(localStorage.getItem(COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
}

// 시연용 기준값 + 이 브라우저에서 받은 처방 수
export const getConnectedCount = () => stats.counter.base + getLocalCount();
