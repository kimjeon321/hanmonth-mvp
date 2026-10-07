import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { regions, getPolicies, formatWon } from '../data';
import PolicyCard from '../components/PolicyCard';

// 마커 모양: 위치 점 + 이모지·지역 이름표 (이미지 파일 없이 동작)
// 가까운 지역끼리 겹치면 regions.json의 labelSide("left" 또는 "right")로 이름표 방향을 바꿉니다.
function makeIcon(region, selected) {
  const side = region.labelSide || 'center';
  return L.divIcon({
    className: '',
    html: `<div class="pin-anchor"><i class="pin-dot"></i><div class="pin-label ${side}"><div class="map-pin ${selected ? 'selected' : ''}"><span>${region.emoji}</span>${region.name}</div></div></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapPage() {
  const [selectedId, setSelectedId] = useState(regions[0].id);
  const selected = regions.find((r) => r.id === selectedId);
  const policies = getPolicies(selected.id);

  return (
    <div className="map-layout">
      <section className="map-wrap">
        {/* 화면 크기에 맞춰 모든 지역이 보이도록 자동으로 확대/축소 */}
        <MapContainer
          bounds={regions.map((r) => [r.lat, r.lng])}
          boundsOptions={{ padding: [70, 70] }}
          scrollWheelZoom
          className="map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {regions.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={makeIcon(r, r.id === selectedId)}
              eventHandlers={{ click: () => setSelectedId(r.id) }}
            />
          ))}
        </MapContainer>
        <p className="map-hint">📍 지도의 지역 마커를 눌러 보세요</p>
      </section>

      <aside className="side-panel">
        <div className="region-tabs">
          {regions.map((r) => (
            <button
              key={r.id}
              className={`chip ${r.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(r.id)}
            >
              {r.emoji} {r.name}
            </button>
          ))}
        </div>

        <div className="card">
          <p className="muted small">{selected.province}</p>
          <h2>{selected.emoji} {selected.name}</h2>
          <p className="tagline">{selected.tagline}</p>
          <p className="muted small">예상 한 달 생활비 약 {formatWon(selected.monthlyCost)}</p>

          <h3>한 달 살기 지원 정책 {policies.length}건</h3>
          {policies.map((p) => (
            <PolicyCard key={p.id} policy={p} compact />
          ))}

          <Link to={`/region/${selected.id}`} className="btn primary block">
            {selected.name} 자세히 보기 →
          </Link>
        </div>
      </aside>
    </div>
  );
}
