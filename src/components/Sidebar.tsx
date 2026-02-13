import React from 'react';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Wrench,
    FileSpreadsheet,
    Settings,
    LogOut,
    CheckCircle,
    ShoppingCart,
    ClipboardSignature,
    Folder,
    QrCode,
    Building2,
    Book,
    Clock,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const navigate = useNavigate();
    const { role, user, isAdmin } = useAuth();

    const isApp = Capacitor.getPlatform() !== 'web';

    const isRestricted = isApp;

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Limpa o estado local redirecionando e recarregando para garantir
            navigate('/login');
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao sair:', error);
            window.location.href = '/login';
        }
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
                {/* ACESSO COMUM: Painel visível para todos exceto Perito no mobile e Clientes */}
                {!isRestricted && role !== 'cliente' && (
                    <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard size={20} />
                        <span>Painel</span>
                    </NavLink>
                )}

                {/* ACESSO CLIENTE: Opções específicas do cliente */}
                {role === 'cliente' ? (
                    <>
                        <NavLink to="/meus-relatorios" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <FileSpreadsheet size={20} />
                            <span>Relatórios</span>
                        </NavLink>
                        <NavLink to="/databook" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <Book size={20} />
                            <span>Data Books</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        {/* ACESSO EQUIPE INTERNA */}
                        <NavLink to="/nova-peritagem" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <PlusCircle size={20} />
                            <span>Nova Peritagem</span>
                        </NavLink>

                        <NavLink to="/peritagens" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <FileText size={20} />
                            <span>Peritagens</span>
                        </NavLink>

                        {/* Itens que antes eram apenas WEB, mas são úteis no mobile também */}
                        {!isRestricted && (
                            <>
                                <NavLink to="/relatorios" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <FileSpreadsheet size={20} />
                                    <span>Relatórios</span>
                                </NavLink>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <NavLink to="/pcp/aguardando" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Clock size={20} />
                                    <span>Aguardando Peritagem</span>
                                </NavLink>

                                {['gestor', 'pcp'].includes(role || '') && (
                                    <>
                                        <NavLink to="/pcp/aprovar" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                            <ClipboardSignature size={20} />
                                            <span>1. Aprovação de Peritagem</span>
                                        </NavLink>

                                        <NavLink to="/pcp/liberar" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                            <ShoppingCart size={20} />
                                            <span>2. Liberação do Pedido</span>
                                        </NavLink>
                                    </>
                                )}

                                <NavLink to="/manutencao" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Wrench size={20} />
                                    <span>3. Cilindros em Manutenção</span>
                                </NavLink>

                                {['gestor', 'pcp'].includes(role || '') && (
                                    <NavLink to="/pcp/finalizar" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                        <CheckCircle size={20} />
                                        <span>4. Conferência Final</span>
                                    </NavLink>
                                )}

                                <div className="sidebar-divider"></div>

                                <NavLink to="/registro-fotos" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Folder size={20} />
                                    <span>Armazenamento de Fotos e Vídeos</span>
                                </NavLink>

                                <NavLink to="/databook" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Book size={20} />
                                    <span>Data Books</span>
                                </NavLink>

                                <NavLink to="/qrcode" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <QrCode size={20} />
                                    <span>Gerar QR code</span>
                                </NavLink>
                            </>
                        )}


                        {role === 'gestor' && !isRestricted && (
                            <>
                                <NavLink to="/admin/usuarios" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Settings size={20} />
                                    <span>Gestão de Usuários</span>
                                </NavLink>
                                <NavLink to="/admin/empresas" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                    <Building2 size={20} />
                                    <span>Gestão de Clientes</span>
                                </NavLink>
                            </>
                        )}
                    </>
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
