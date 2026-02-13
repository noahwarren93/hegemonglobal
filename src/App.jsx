import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HowToUse from './pages/HowToUse';
import TVDashboard from './pages/TVDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/tv" element={<TVDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
