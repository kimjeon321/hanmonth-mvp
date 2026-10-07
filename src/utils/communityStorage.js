// 커뮤니티 후기를 브라우저(localStorage)에 저장합니다.
// 새로고침해도 유지되고, "샘플로 초기화"를 누르면 처음 상태로 돌아갑니다.
import { sampleReviews } from '../data';

const KEY = 'hanmonth-reviews-v2'; // 지역이 바뀌어 저장 키도 새로 사용

export function loadReviews() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 쓸 수 없는 환경이면 샘플을 보여줍니다.
  }
  return sampleReviews;
}

export function saveReviews(reviews) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reviews));
  } catch {
    // 저장 실패 시에도 화면은 정상 동작합니다.
  }
}

export function resetReviews() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
  return sampleReviews;
}
