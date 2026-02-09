import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Loader2, Trash2 } from 'lucide-react';
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
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchPeritagens();
    }, [user, role, filterStatus]);

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

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                        <p>Carregando peritagens...</p>
                    </div>
                ) : (
                    <table className="peritagens-table">
                        <thead>
                            <tr>
                                <th>Número da Ordem de Serviço</th>
                                <th>Cliente</th>
                                <th>Data da Execução</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPeritagens.map((p) => (
                                <tr key={p.id}>
                                    <td className="peritagem-id" data-label="O.S">
                                        {p.os_interna ? (
                                            <>
                                                <span style={{ fontWeight: 'bold', display: 'block' }}>{p.os_interna}</span>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
                                                    Ref: {p.numero_peritagem}
                                                </span>
                                            </>
                                        ) : (
                                            <span style={{ fontWeight: 'bold' }}>{p.numero_peritagem}</span>
                                        )}
                                    </td>
                                    <td data-label="Cliente">{p.cliente}</td>
                                    <td data-label="Data">{new Date(p.data_execucao).toLocaleDateString('pt-BR')}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${p.status.toLowerCase().replace(/ /g, '-')}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td data-label="Prioridade">{p.prioridade}</td>
                                    <td>
                                        {(() => {
                                            const statusUpper = p.status?.trim().toUpperCase() || '';
                                            const isRejection = statusUpper === 'REVISÃO NECESSÁRIA';
                                            const isApproved = statusUpper === 'APROVADO';

                                            // Lógica de Permissão de Edição
                                            // Perito pode editar qualquer coisa que NÃO esteja APROVADA
                                            // PCP/Gestor podem editar/visualizar tudo (mantendo comportamento padrão por enquanto)
                                            const canEdit = role === 'perito' ? !isApproved : true;

                                            return (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        className={`btn-action ${isRejection ? 'btn-edit' : ''}`}
                                                        onClick={() => {
                                                            if (canEdit) {
                                                                navigate(`/nova-peritagem?id=${p.id}`);
                                                            } else {
                                                                navigate(`/monitoramento?id=${p.id}`);
                                                            }
                                                        }}
                                                    >
                                                        {canEdit ? (
                                                            <>
                                                                <span>{isRejection ? 'CORRIGIR' : 'EDITAR'}</span>
                                                                <ExternalLink size={16} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>VER DETALHES</span>
                                                                <ExternalLink size={16} />
                                                            </>
                                                        )}
                                                    </button>
                                                    {role === 'gestor' && (
                                                        <button
                                                            className="btn-icon-danger"
                                                            onClick={() => handleDelete(p.id)}
                                                            title="Excluir Peritagem"
                                                            style={{
                                                                background: '#fee2e2',
                                                                border: 'none',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                color: '#e53e3e',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                            {filteredPeritagens.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhuma peritagem encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
