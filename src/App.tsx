import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Lazy Load Pages
const LoginPage = React.lazy(() => import('./pages/Login').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/Register').then(module => ({ default: module.RegisterPage })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Peritagens = React.lazy(() => import('./pages/Peritagens').then(module => ({ default: module.Peritagens })));
const Monitoramento = React.lazy(() => import('./pages/Monitoramento').then(module => ({ default: module.Monitoramento })));
const Relatorios = React.lazy(() => import('./pages/Relatorios').then(module => ({ default: module.Relatorios })));
const NovaPeritagem = React.lazy(() => import('./pages/NovaPeritagem').then(module => ({ default: module.NovaPeritagem })));
const Clientes = React.lazy(() => import('./pages/Clientes').then(module => ({ default: module.Clientes })));
const Manutencao = React.lazy(() => import('./pages/Manutencao').then(module => ({ default: module.Manutencao })));
const PcpAprovaPeritagem = React.lazy(() => import('./pages/PcpAprovaPeritagem').then(module => ({ default: module.PcpAprovaPeritagem })));
const PcpLiberaPedido = React.lazy(() => import('./pages/PcpLiberaPedido').then(module => ({ default: module.PcpLiberaPedido })));
const PcpFinalizaProcesso = React.lazy(() => import('./pages/PcpFinalizaProcesso').then(module => ({ default: module.PcpFinalizaProcesso })));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers').then(module => ({ default: module.AdminUsers })));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="loader" style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, role, loading } = useAuth();

  const isApp = Capacitor.getPlatform() !== 'web';

  const isRestricted = isApp;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;

  if (!session) return <Navigate to="/login" />;

  // Se for restrito (App ou Perito), só pode acessar Nova Peritagem e Minhas Peritagens
  const currentPath = window.location.pathname;
  const isAllowedPath = currentPath === '/nova-peritagem' || currentPath === '/peritagens';

  if (isRestricted && !isAllowedPath) {
    return <Navigate to="/peritagens" />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/peritagens" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return null;

  const isApp = Capacitor.getPlatform() !== 'web';

  const isRestricted = isApp;

  const defaultPath = isRestricted ? "/peritagens" : "/dashboard";

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={session ? <Navigate to={defaultPath} /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to={defaultPath} /> : <RegisterPage />} />

        <Route path="/" element={<Navigate to={session ? defaultPath : "/login"} replace />} />

        {/* Rotas Protegidas */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/peritagens" element={<PrivateRoute><Layout><Peritagens /></Layout></PrivateRoute>} />
        <Route path="/monitoramento" element={<PrivateRoute><Layout><Monitoramento /></Layout></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Layout><Clientes /></Layout></PrivateRoute>} />
        <Route path="/manutencao" element={<PrivateRoute><Layout><Manutencao /></Layout></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute><Layout><Relatorios /></Layout></PrivateRoute>} />
        <Route path="/nova-peritagem" element={<PrivateRoute><Layout><NovaPeritagem /></Layout></PrivateRoute>} />

        {/* Rotas de Fluxo PCP */}
        <Route path="/pcp/aprovar" element={<PrivateRoute allowedRoles={['pcp', 'gestor', 'perito']}><Layout><PcpAprovaPeritagem /></Layout></PrivateRoute>} />
        <Route path="/pcp/liberar" element={<PrivateRoute allowedRoles={['pcp', 'gestor', 'perito']}><Layout><PcpLiberaPedido /></Layout></PrivateRoute>} />
        <Route path="/pcp/finalizar" element={<PrivateRoute allowedRoles={['pcp', 'gestor', 'perito']}><Layout><PcpFinalizaProcesso /></Layout></PrivateRoute>} />

        {/* Rota Exclusiva Gestor */}
        <Route path="/admin/usuarios" element={
          <PrivateRoute allowedRoles={['gestor']}>
            <Layout><AdminUsers /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Suspense>
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
