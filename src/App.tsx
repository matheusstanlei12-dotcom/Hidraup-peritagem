import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Peritagens } from './pages/Peritagens';
import { Monitoramento } from './pages/Monitoramento';
import { Relatorios } from './pages/Relatorios';
import { NovaPeritagem } from './pages/NovaPeritagem';
import { Clientes } from './pages/Clientes';
import { Manutencao } from './pages/Manutencao';
import { AdminUsers } from './pages/AdminUsers';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, role, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;

  if (!session) return <Navigate to="/login" />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />

      {/* Rotas Protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/peritagens" element={<PrivateRoute><Layout><Peritagens /></Layout></PrivateRoute>} />
      <Route path="/monitoramento" element={<PrivateRoute><Layout><Monitoramento /></Layout></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>} />
      <Route path="/manutencao" element={<PrivateRoute><Layout><Manutencao /></Layout></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Layout><Relatorios /></Layout></PrivateRoute>} />
      <Route path="/nova-peritagem" element={<PrivateRoute><Layout><NovaPeritagem /></Layout></PrivateRoute>} />

      {/* Rota Exclusiva Gestor */}
      <Route path="/admin/usuarios" element={
        <PrivateRoute allowedRoles={['gestor']}>
          <Layout><AdminUsers /></Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
