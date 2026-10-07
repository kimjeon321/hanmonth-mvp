import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import PrescriptionPage from './pages/PrescriptionPage';
import MapPage from './pages/MapPage';
import RegionPage from './pages/RegionPage';
import CommunityPage from './pages/CommunityPage';
import GovDemoPage from './pages/GovDemoPage';

const MENU = [
  { to: '/', label: '홈', icon: '🏡' },
  { to: '/diagnosis', label: '진단', icon: '🩺' },
  { to: '/map', label: '지도', icon: '🗺️' },
  { to: '/community', label: '처방 후기', icon: '💊' },
  { to: '/gov', label: '지자체', icon: '🏛️' },
];

export default function App() {
  const { pathname } = useLocation();

  // 페이지를 옮기면 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="logo">🏡 한달살이</NavLink>
        <nav className="nav">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'}>
              <span className="nav-icon">{m.icon}</span>
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/prescription" element={<PrescriptionPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/region/:id" element={<RegionPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/gov" element={<GovDemoPage />} />
        </Routes>
      </main>

      <footer className="footer muted small">
        공모전 시연용 프로토타입 · 지원 사업은 공개 기사·공고 기준(2026.10.7 정리), 소비·생활 지수·평점·후기는 시연용
        샘플입니다
      </footer>
    </div>
  );
}
