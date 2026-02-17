import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

const HowToUse = lazy(() => import('./pages/HowToUse'));
const TVDashboard = lazy(() => import('./pages/TVDashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ background: '#050508', color: '#6b7280', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/tv" element={<TVDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
