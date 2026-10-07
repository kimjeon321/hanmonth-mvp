import { useState } from 'react';
import Stars from './Stars';

const TABS = ['전체', '맛집', '명소'];

// 맛집·명소 목록. 카드를 누르면 리뷰가 펼쳐집니다.
export default function PlaceList({ places }) {
  const [tab, setTab] = useState('전체');
  const [openId, setOpenId] = useState(null);

  const shown = tab === '전체' ? places : places.filter((p) => p.type === tab);

  return (
    <div>
      <div className="chips">
        {TABS.map((t) => (
          <button
            key={t}
            className={`chip ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="place-list">
        {shown.map((place) => {
          const open = openId === place.id;
          return (
            <li key={place.id} className="place-item">
              <button className="place-summary" onClick={() => setOpenId(open ? null : place.id)}>
                <div>
                  <span className="tag">{place.type === '맛집' ? '🍽️' : '📍'} {place.category}</span>
                  <strong className="place-name">{place.name}</strong>
                  <p className="muted small">{place.description}</p>
                </div>
                <div className="place-rating">
                  <Stars value={place.rating} />
                  <span className="small muted">
                    {place.rating} · 리뷰 {place.reviews.length} {open ? '▲' : '▼'}
                  </span>
                </div>
              </button>
              {open && (
                <ul className="mini-reviews">
                  {place.reviews.map((r, i) => (
                    <li key={i}>
                      <Stars value={r.rating} /> <strong>{r.author}</strong>
                      <p>{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
