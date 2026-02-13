import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Loader2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    data_execucao: string;
    status: string;
    prioridade: string;
    criado_por: string;
    os_interna?: string;
}

export const Peritagens: React.FC = () => {
    const { user, role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'recusadas'>('all'); // Filtro para Perito
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (role === 'cliente') {
                fetchUserEmpresa();
            } else {
                fetchPeritagens();
            }
        }
    }, [user, role, filterStatus]);

    useEffect(() => {
        if (role === 'cliente' && empresaId) {
            fetchPeritagens();
        }
    }, [empresaId]);

    const fetchUserEmpresa = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('empresa_id')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            setEmpresaId(data?.empresa_id || null);
        } catch (err) {
            console.error('Erro ao buscar empresa do usuário:', err);
            setLoading(false);
        }
    };

    const fetchPeritagens = async () => {
        try {
            let query = supabase
                .from('peritagens')
                .select('*')
                .order('created_at', { ascending: false });

            // Se for PERITO, filtrar apenas as suas
            if (role === 'perito') {
                query = query.eq('criado_por', user.id);

                // Se estiver vendo recusadas
                if (filterStatus === 'recusadas') {
                    query = query.eq('status', 'REVISÃO NECESSÁRIA');
                }
            }

            if (role === 'cliente') {
                if (empresaId) {
                    query = query.eq('empresa_id', empresaId);
                } else {
                    setPeritagens([]);
                    setLoading(false);
                    return;
                }
            }

            const { data, error } = await query;

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro ao buscar peritagens:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta peritagem? Esta ação não pode ser desfeita.')) return;

        try {
            const { error } = await supabase
                .from('peritagens')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Peritagem excluída com sucesso.');
        } catch (error) {
            console.error('Erro ao excluir peritagem:', error);
            alert('Erro ao excluir peritagem. Verifique se existem registros vinculados.');
        }
    };

    const filteredPeritagens = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.os_interna && p.os_interna.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="peritagens-container">
            <div className="header-actions">
                <h1 className="page-title">{role === 'perito' ? 'Minhas Peritagens' : 'Todas as Peritagens'}</h1>

                {role === 'perito' && (
                    <div className="filter-group">
                        <button
                            className={`btn-filter ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            Todas
                        </button>
                        <button
                            className={`btn-filter recusadas ${filterStatus === 'recusadas' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('recusadas')}
                        >
                            🔴 Recusadas
                        </button>
                    </div>
                )}
                <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/nova-peritagem')}>
                    <Plus size={20} />
                    <span>Nova Peritagem</span>
                </button>
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid-container">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#2563eb" />
                        <p>Carregando peritagens...</p>
                    </div>
                ) : (
                    <div className="peritagens-grid">
                        {filteredPeritagens.map((p) => {
                            const statusUpper = p.status?.trim().toUpperCase() || '';
                            const isRejection = statusUpper === 'REVISÃO NECESSÁRIA';
                            const isApproved = statusUpper === 'APROVADO';
                            const canEdit = role === 'perito' ? !isApproved : true;

                            const getStatusColorClass = (status: string) => {
                                const s = status.toUpperCase();
                                if (s.includes('FINALIZADO')) return 'status-finalizado';
                                if (s.includes('MANUTENÇÃO') || s.includes('ABERTO') || s.includes('OFICINA')) return 'status-manutencao';
                                if (s.includes('AGUARDANDO APROVAÇÃO') || s.includes('AGUARDANDO PEDIDO') || s.includes('ORÇAMENTO ENVIADO') || s.includes('AGUARDANDO CLIENTE')) return 'status-aprovacao';
                                if (s.includes('REVISÃO')) return 'status-revisao';
                                return 'status-aguardando';
                            };

                            return (
                                <div key={p.id} className={`peritagem-card ${isRejection ? 'revisao-border' : ''}`}>
                                    <div className="card-header">
                                        <div>
                                            <span className="os-badge">{p.os_interna || 'SEM O.S'}</span>
                                            <span className="ref-text">Ref: {p.numero_peritagem}</span>
                                        </div>
                                        <span className={`status-pill ${getStatusColorClass(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <h3 className="client-name">{p.cliente}</h3>

                                        <div className="info-row">
                                            <Calendar size={16} />
                                            <span>{new Date(p.data_execucao).toLocaleDateString('pt-BR')}</span>
                                        </div>

                                        <div className="info-row">
                                            <AlertCircle size={16} />
                                            <span className={`priority-badge ${p.prioridade.toLowerCase() === 'urgente' ? 'priority-urgente' : 'priority-normal'}`}>
                                                Prioridade: {p.prioridade}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className={`btn-main-action ${canEdit ? 'btn-main-edit' : 'btn-main-view'}`}
                                            onClick={() => {
                                                if (canEdit) {
                                                    navigate(`/nova-peritagem?id=${p.id}`);
                                                } else {
                                                    navigate(`/monitoramento?id=${p.id}`);
                                                }
                                            }}
                                        >
                                            {canEdit ? (isRejection ? 'CORRIGIR' : 'EDITAR') : 'VER DETALHES'}
                                            <ExternalLink size={16} />
                                        </button>

                                        {role === 'gestor' && (
                                            <button
                                                className="btn-main-action btn-main-danger"
                                                onClick={() => handleDelete(p.id)}
                                                style={{ flex: '0 0 45px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredPeritagens.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        Nenhuma peritagem encontrada.
                    </div>
                )}
            </div>
        </div>
    );
};
