import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Peritagens } from './pages/Peritagens';
import { Monitoramento } from './pages/Monitoramento';
import { Relatorios } from './pages/Relatorios';
import { Layout } from './components/Layout';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/peritagens"
          element={
            <Layout>
              <Peritagens />
            </Layout>
          }
        />
        <Route
          path="/monitoramento"
          element={
            <Layout>
              <Monitoramento />
            </Layout>
          }
        />
        <Route
          path="/relatorios"
          element={
            <Layout>
              <Relatorios />
            </Layout>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Futuras rotas serão adicionadas aqui */}
      </Routes>
    </Router>
  );
}

export default App;
