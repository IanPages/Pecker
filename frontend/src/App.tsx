import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './feature/dashboard/components/Layout';
import { Dashboard } from './feature/dashboard/components/Dashboard';
import { Schedule } from './feature/schedule/components/Schedule';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
