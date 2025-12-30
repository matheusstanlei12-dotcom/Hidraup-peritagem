import React, { useState, useEffect } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    ordem_servico: string;
    nota_fiscal: string;
    camisa_int: string;
    camisa_ext: string;
    camisa_comp: string;
    haste_diam: string;
    haste_comp: string;
    curso: string;
    status: string;
}

export const PcpAprovaPeritagem: React.FC = () => {
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
                .or('status.eq.PERITAGEM CRIADA,status.eq.AGUARDANDO APROVAÇÃO DO PCP')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('peritagens')
                .update({ status: 'AGUARDANDO APROVAÇÃO DO CLIENTE' })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO APROVAÇÃO DO PCP',
                status_novo: 'AGUARDANDO APROVAÇÃO DO CLIENTE',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Peritagem aprovada e enviada para o comercial.');
        } catch (err) {
            alert('Erro ao aprovar.');
        }
    };

    const filtered = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <h1 className="page-title">1. Aprovação de Peritagem (PCP)</h1>

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
                                <span className="status-badge peritagem-criada">{p.status}</span>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '1rem',
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '1.5rem'
                            }}>
                                <div><small style={{ color: '#a0aec0' }}>O.S.</small><br /><strong>{p.ordem_servico || '---'}</strong></div>
                                <div><small style={{ color: '#a0aec0' }}>C. INT/EXT</small><br /><strong>{p.camisa_int || '---'}/{p.camisa_ext || '---'}</strong></div>
                                <div><small style={{ color: '#a0aec0' }}>H. DIÂMETRO</small><br /><strong>{p.haste_diam || '---'}</strong></div>
                                <div><small style={{ color: '#a0aec0' }}>CURSO</small><br /><strong>{p.curso || '---'}</strong></div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleApprove(p.id)}
                                    style={{
                                        flex: 1,
                                        padding: '0.8rem',
                                        background: '#3182ce',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Check size={18} /> Aprovar Peritagem
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#718096' }}>Nenhuma peritagem pendente.</p>}
            </div>
        </div>
    );
};
