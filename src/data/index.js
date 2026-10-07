// 모든 화면은 이 파일을 통해서만 데이터를 가져옵니다.
// 나중에 실제 공공데이터(API)로 바꿀 때는 이 파일과 JSON만 고치면 됩니다.
import regions from './regions.json';
import policies from './policies.json';
import places from './places.json';
import spending from './spending.json';
import reviews from './reviews.json';
import burnoutTypes from './burnoutTypes.json';
import questions from './questions.json';
import stats from './stats.json';

export { regions, policies, spending, burnoutTypes, questions, stats };

export const getRegion = (id) => regions.find((r) => r.id === id);
export const getPolicies = (regionId) => policies.filter((p) => p.regionId === regionId);
export const getPlaces = (regionId) => places.filter((p) => p.regionId === regionId);
export const getSpending = (regionId) => spending.regions[regionId];
export const getBurnoutType = (id) => burnoutTypes.find((t) => t.id === id);
export const sampleReviews = reviews;

// 숫자를 "150만 원" 형태로 보여줍니다.
export const formatWon = (won) => `${Math.round(won / 10000).toLocaleString()}만 원`;
