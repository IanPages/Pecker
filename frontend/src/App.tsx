import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './feature/dashboard/components/Layout';
import { Schedule } from './feature/schedule/components/Schedule';
import { Goals } from './feature/goals/components/Goals';
import { GoalDetail } from './feature/goals/components/GoalDetail';
import { LogReg } from './feature/auth/components/LogReg';
import { GuestRoute } from './feature/auth/components/GuestRoute';
import { ProtectedRoute } from './feature/auth/components/ProtectedRoute';
import { HomeRoute } from './feature/auth/components/HomeRoute';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/goals/:id" element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} />
          <Route path="/login" element={<GuestRoute><LogReg /></GuestRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
