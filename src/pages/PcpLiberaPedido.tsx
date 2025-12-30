import React, { useState, useEffect } from 'react';
import { Search, Loader2, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    status: string;
    numero_pedido?: string;
}

export const PcpLiberaPedido: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderInputs, setOrderInputs] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchPeritagens();
    }, []);

    const fetchPeritagens = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .or('status.eq.AGUARDANDO APROVAÇÃO DO CLIENTE,status.eq.Aguardando Clientes')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (id: string) => {
        const orderNum = orderInputs[id];
        if (!orderNum || !user) {
            alert('Por favor, informe o número do pedido.');
            return;
        }

        try {
            const { error } = await supabase
                .from('peritagens')
                .update({
                    status: 'EM MANUTENÇÃO',
                    numero_pedido: orderNum
                })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO APROVAÇÃO DO CLIENTE',
                status_novo: 'EM MANUTENÇÃO',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Pedido liberado para manutenção!');
        } catch (err) {
            alert('Erro ao liberar pedido.');
        }
    };

    const handleInputChange = (id: string, value: string) => {
        setOrderInputs(prev => ({ ...prev, [id]: value }));
    };

    const filtered = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <h1 className="page-title">2. Liberação de Pedido (PCP/Comercial)</h1>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="pcp-approval-grid">
                {loading ? (
                    <div className="loading-state"><Loader2 className="animate-spin" /></div>
                ) : (
                    filtered.map(p => (
                        <div key={p.id} className="pcp-action-card" style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#2d3748' }}>{p.cliente}</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#718096' }}>ID: {p.numero_peritagem}</span>
                                </div>
                                <span className="status-badge warning">{p.status}</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>
                                    Número do Pedido do Cliente:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 4500123456"
                                    value={orderInputs[p.id] || ''}
                                    onChange={(e) => handleInputChange(p.id, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e0',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <button
                                onClick={() => handleRelease(p.id)}
                                disabled={!orderInputs[p.id]}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: orderInputs[p.id] ? '#ed8936' : '#e2e8f0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: orderInputs[p.id] ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <ShoppingCart size={18} /> Liberar para Manutenção
                            </button>
                        </div>
                    ))
                )}
                {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#718096' }}>Nada para liberar.</p>}
            </div>
        </div>
    );
};
