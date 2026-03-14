import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Calendar, Trash2, ClipboardSignature } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';
import './PcpCommon.css';

interface ItemAguardando {
    id: string;
    os_interna: string;
    numero_ordem?: string;
    ni?: string;
    nf?: string;
    numero_laudo?: string;
    cliente: string;
    data_chegada: string;
    status: string;
    descricao_equipamento?: string;
}

export const AguardandoPeritagem: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [itens, setItens] = useState<ItemAguardando[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchItens();
    }, []);

    const fetchItens = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('aguardando_peritagem')
                .select('*')
                .eq('status', 'AGUARDANDO')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItens(data || []);
        } catch (err) {
            console.error('Erro ao buscar itens:', err);
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            const { error } = await supabase
                .from('aguardando_peritagem')
                .delete()
                .eq('id', itemToDelete);

            if (error) throw error;

            setItens(prev => prev.filter(item => item.id !== itemToDelete));
            setItemToDelete(null);
        } catch (err: any) {
            console.error('Erro ao deletar:', err);
            alert('Erro ao deletar item: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = itens.filter(item =>
        item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.os_interna.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.numero_ordem || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.numero_laudo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <div className="header-section">
                <h1 className="page-title">Aguardando Peritagem</h1>
                {role === 'pcp' || role === 'gestor' ? (
                    <button className="btn-primary" onClick={() => navigate('/nova-peritagem?from_waitlist=true')}>
                        <Plus size={20} />
                        <span>Novo Item</span>
                    </button>
                ) : null}
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou O.S..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>



            <div className="pcp-approval-grid">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#2563eb" />
                        <p>Carregando itens...</p>
                    </div>
                ) : (
                    filtered.map(item => (
                        <div
                            key={item.id}
                            className="pcp-action-card"
                            onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                            style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                            <div className="pcp-card-header">
                                <div>
                                    <span className="report-id-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                        {item.os_interna}
                                    </span>
                                </div>
                                <span className="status-pill status-aguardando" style={{ padding: '5px 10px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', background: '#f1f5f9', color: '#475569' }}>
                                    AGUARDANDO PERITAGEM
                                </span>
                            </div>

                            <div className="pcp-body">
                                <h3 className="pcp-card-client" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                                    {item.cliente}
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                    {item.numero_ordem && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', background: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: '5px' }}>
                                            Ordem: {item.numero_ordem}
                                        </span>
                                    )}
                                    {item.ni && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', background: '#fefce8', color: '#854d0e', padding: '3px 8px', borderRadius: '5px' }}>
                                            NI: {item.ni}
                                        </span>
                                    )}
                                    {item.nf && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', background: '#fef2f2', color: '#991b1b', padding: '3px 8px', borderRadius: '5px' }}>
                                            NF: {item.nf}
                                        </span>
                                    )}
                                    {item.numero_laudo && (
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', background: '#f5f3ff', color: '#5b21b6', padding: '3px 8px', borderRadius: '5px' }}>
                                            Laudo: {item.numero_laudo}
                                        </span>
                                    )}
                                </div>
                                <div className="report-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <Calendar size={16} />
                                    <span style={{ fontSize: '0.85rem' }}>Data: {new Date(item.data_chegada).toLocaleDateString('pt-BR')}</span>
                                </div>

                                {selectedItemId === item.id && item.descricao_equipamento && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            Descrição do Equipamento
                                        </label>
                                        <p style={{ fontSize: '0.9rem', color: '#1e293b', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                            {item.descricao_equipamento}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pcp-footer" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-report-primary"
                                    style={{ width: '100%', background: '#21408e', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/nova-peritagem?id_waitlist=${item.id}`);
                                    }}
                                >
                                    <ClipboardSignature size={16} />
                                    <span>Iniciar Peritagem</span>
                                </button>
                                {(role === 'pcp' || role === 'gestor') && (
                                    <button
                                        className="btn-report-outline"
                                        style={{ width: 'fit-content', color: '#ef4444', borderColor: '#fee2e2', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', background: 'white', border: '1px solid #fee2e2' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToDelete(item.id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Nenhum cilindro aguardando peritagem.
                </div>
            )}
            {itemToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Confirmar Exclusão</h2>
                            <button className="close-btn" onClick={() => setItemToDelete(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Tem certeza que deseja excluir este item da lista de espera? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn-report btn-report-outline" onClick={() => setItemToDelete(null)}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-report btn-report-primary" 
                                style={{ background: '#ef4444', border: 'none' }}
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
