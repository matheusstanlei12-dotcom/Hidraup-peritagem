import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';
import './PcpCommon.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    status: string;
    numero_pedido?: string;
    os_interna?: string;
}

export const PcpFinalizaProcesso: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeritagens();
    }, []);

    const fetchPeritagens = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .eq('status', 'AGUARDANDO CONFERÊNCIA FINAL')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('peritagens')
                .update({ status: 'PROCESSO FINALIZADO' })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO CONFERÊNCIA FINAL',
                status_novo: 'PROCESSO FINALIZADO',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Processo finalizado e enviado para expedição!');
        } catch (err) {
            alert('Erro ao finalizar processo.');
        }
    };

    const filtered = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.os_interna && p.os_interna.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="peritagens-container">
            <h1 className="page-title">3. Conferência Final</h1>

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
                        <div key={p.id} className="pcp-action-card">
                            <div className="pcp-card-header">
                                <div>
                                    <span className="report-id-badge" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                                        {p.os_interna || 'SEM O.S'}
                                    </span>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>
                                        Ref: {p.numero_peritagem}
                                    </span>
                                </div>
                                <span className="status-pill" style={{ padding: '5px 10px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', background: '#e0f2fe', color: '#0369a1' }}>
                                    AGUARDANDO PCP
                                </span>
                            </div>

                            <div className="pcp-body">
                                <h3 className="pcp-card-client" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                                    {p.cliente}
                                </h3>

                                <div style={{
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Pedido Liberado:</span>
                                    <h2 style={{ margin: '4px 0', color: '#2563eb', fontSize: '1.2rem', fontWeight: '800' }}>#{p.numero_pedido || '---'}</h2>
                                </div>
                            </div>

                            <div className="pcp-footer">
                                <button
                                    className="btn-pcp-action"
                                    onClick={() => handleFinalize(p.id)}
                                    style={{ background: '#16a34a' }}
                                >
                                    <CheckCircle2 size={18} /> Finalizar Processo
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#718096' }}>Nenhum processo aguardando sua conferência.</p>}
            </div>
        </div>
    );
};
