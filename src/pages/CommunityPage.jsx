import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { regions, burnoutTypes, getRegion, getBurnoutType } from '../data';
import { loadReviews, saveReviews, resetReviews } from '../utils/communityStorage';
import { loadPrescription } from '../utils/prescriptionStorage';
import Stars from '../components/Stars';
import { SampleBadge } from '../components/Badges';

// 처방전을 받은 적이 있으면 그 지역·유형을 글쓰기 기본값으로 사용
function initialForm() {
  const last = loadPrescription();
  return {
    regionId: last?.ranking?.[0]?.regionId || regions[0].id,
    burnoutType: last?.typeId || burnoutTypes[0].id,
    author: '',
    rating: 5,
    content: '',
  };
}

export default function CommunityPage() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('region') || 'all';

  const [reviews, setReviews] = useState(loadReviews);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);

  const shown = filter === 'all' ? reviews : reviews.filter((r) => r.regionId === filter);
  const setFilter = (id) => setParams(id === 'all' ? {} : { region: id });

  const submit = (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    const newReview = {
      ...form,
      id: `u${Date.now()}`,
      author: form.author.trim() || '익명',
      content: form.content.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    const next = [newReview, ...reviews];
    setReviews(next);
    saveReviews(next);
    setForm({ ...initialForm(), regionId: form.regionId, burnoutType: form.burnoutType });
    setShowForm(false);
    setFilter(form.regionId);
  };

  const reset = () => {
    if (confirm('작성한 후기를 모두 지우고 샘플 후기로 되돌릴까요?')) {
      setReviews(resetReviews());
    }
  };

  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <h1>💊 처방 후기</h1>
          <p className="muted small">한 달 살기 처방을 받고 다녀온 사람들의 이야기</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '닫기' : '✏️ 후기 쓰기'}
        </button>
      </div>

      {showForm && (
        <form className="card form" onSubmit={submit}>
          <div className="form-row">
            <label>
              지역
              <select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label>
              처방 유형
              <select value={form.burnoutType} onChange={(e) => setForm({ ...form, burnoutType: e.target.value })}>
                {burnoutTypes.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </label>
            <label>
              별점
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </label>
            <label>
              닉네임
              <input
                value={form.author}
                placeholder="익명"
                maxLength={12}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </label>
          </div>
          <label>
            내용
            <textarea
              rows={4}
              value={form.content}
              placeholder="처방받은 한 달, 어떻게 회복했나요?"
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </label>
          <button className="btn primary" type="submit">등록하기</button>
        </form>
      )}

      <div className="chips">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          전체 {reviews.length}
        </button>
        {regions.map((r) => (
          <button
            key={r.id}
            className={`chip ${filter === r.id ? 'active' : ''}`}
            onClick={() => setFilter(r.id)}
          >
            {r.emoji} {r.name} {reviews.filter((v) => v.regionId === r.id).length}
          </button>
        ))}
      </div>

      <ul className="feed">
        {shown.length === 0 && <li className="card empty">아직 후기가 없어요. 첫 후기를 남겨 주세요!</li>}
        {shown.map((r) => {
          const region = getRegion(r.regionId);
          const type = getBurnoutType(r.burnoutType);
          return (
            <li key={r.id} className="card review">
              <div className="review-head">
                <div className="chips tight">
                  {region && <span className="tag">{region.emoji} {region.name}</span>}
                  {type && <span className="tag type-tag">{type.emoji} {type.name} 처방</span>}
                </div>
                <Stars value={r.rating} />
              </div>
              <p>{r.content}</p>
              <p className="muted small">{r.author} · {r.date}</p>
            </li>
          );
        })}
      </ul>

      <p className="muted small center">기본 후기는 시연용 샘플입니다 <SampleBadge /></p>
      <button className="link-btn" onClick={reset}>샘플 후기로 초기화</button>
    </div>
  );
}
