import React from 'react';
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    PlusCircle,
    Wrench,
    FileSpreadsheet,
    Settings,
    LogOut,
    CheckCircle,
    ShoppingCart,
    ClipboardSignature
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const navigate = useNavigate();
    const { role, user } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleLinkClick = () => {
        if (onClose && window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <img src="/logo.png" alt="HIDRAUP Logo" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>

            <nav className="sidebar-nav">
                {/* NOVA PERITAGEM - Essencial para o executor */}
                <NavLink to="/nova-peritagem" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <PlusCircle size={20} />
                    <span>Nova Peritagem</span>
                </NavLink>

                {/* PERITAGENS - Lista de análises */}
                <NavLink to="/peritagens" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <FileText size={20} />
                    <span>{role === 'perito' ? 'Minhas Peritagens' : 'Todas as Peritagens'}</span>
                </NavLink>

                {/* STATUS/MONITORAMENTO - Acompanhar o fluxo */}
                <NavLink to="/monitoramento" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <ClipboardList size={20} />
                    <span>Status de Processos</span>
                </NavLink>

                {/* Ocultando Dashboard, PCP e Relatórios para todos para manter o app simples */}

                {/* GESTÃO DE USUÁRIOS - SE o gestor precisar no app */}
                {role === 'gestor' && (
                    <NavLink to="/admin/usuarios" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Settings size={20} />
                        <span>Gestão de Usuários</span>
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.email?.split('@')[0] || 'Usuário'}</span>
                        <span className="user-role">{role?.toUpperCase() || 'CARREGANDO...'}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sair</span>
                </button>
            </div>
        </aside >
    );
};
