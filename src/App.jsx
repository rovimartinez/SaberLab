import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import Login from './pages/Login';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subject/:id" element={<SubjectDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
