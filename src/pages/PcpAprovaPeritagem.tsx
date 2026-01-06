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
    montagem?: string;
    pressao_nominal?: string;
    fabricante_modelo?: string;
    foto_frontal?: string;
    status: string;
}

interface AnaliseTecnica {
    id: string;
    componente: string;
    conformidade: string;
    anomalias?: string;
    solucao?: string;
    fotos?: string[];
    dimensoes?: string;
    qtd?: string;
}

export const PcpAprovaPeritagem: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeritagem, setSelectedPeritagem] = useState<Peritagem | null>(null);
    const [technicalAnalyses, setTechnicalAnalyses] = useState<AnaliseTecnica[]>([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(false);

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

    const fetchAnalyses = async (peritagemId: string) => {
        try {
            setLoadingAnalyses(true);
            const { data, error } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', peritagemId);

            if (error) throw error;
            setTechnicalAnalyses(data || []);
        } catch (err) {
            console.error('Erro ao buscar análises:', err);
        } finally {
            setLoadingAnalyses(false);
        }
    };

    useEffect(() => {
        if (selectedPeritagem) {
            fetchAnalyses(selectedPeritagem.id);
        }
    }, [selectedPeritagem]);

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
                    <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                    </div>
                ) : (
                    <>
                        {selectedPeritagem ? (
                            <div className="detailed-review-flow">
                                <button className="btn-back-action" onClick={() => setSelectedPeritagem(null)} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ← Voltar para a lista
                                </button>

                                <div className="peritagem-full-review" style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    <h2 style={{ marginBottom: '1.5rem' }}>Revisão Detalhada: {selectedPeritagem.cliente}</h2>

                                    {selectedPeritagem.foto_frontal && (
                                        <div className="review-section" style={{ marginBottom: '2rem' }}>
                                            <h4 className="review-subtitle" style={{ borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem' }}>Foto Frontal do Equipamento</h4>
                                            <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: '8px', padding: '1rem' }}>
                                                <img src={selectedPeritagem.foto_frontal} alt="Frontal" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="review-section" style={{ marginBottom: '2rem' }}>
                                        <h4 className="review-subtitle" style={{ borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem' }}>Identificação e Dimensões</h4>
                                        <div className="peritagem-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>CLIENTE</small> <strong>{selectedPeritagem.cliente}</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>ID PERITAGEM</small> <strong>{selectedPeritagem.numero_peritagem}</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>ORDEM DE SERVIÇO</small> <strong>{selectedPeritagem.ordem_servico || '---'}</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>NOTA FISCAL</small> <strong>{selectedPeritagem.nota_fiscal || '---'}</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>Ø INTERNO</small> <strong>{selectedPeritagem.camisa_int || '---'} mm</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>Ø HASTE</small> <strong>{selectedPeritagem.haste_diam || '---'} mm</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>CURSO</small> <strong>{selectedPeritagem.curso || '---'} mm</strong></div>
                                            <div><small style={{ color: '#a0aec0', display: 'block' }}>FABRICANTE/MODELO</small> <strong>{selectedPeritagem.fabricante_modelo || '---'}</strong></div>
                                        </div>
                                    </div>

                                    <div className="review-section" style={{ marginBottom: '2rem' }}>
                                        <h4 className="review-subtitle" style={{ borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem' }}>Análise Técnica (Checklist)</h4>
                                        {loadingAnalyses ? (
                                            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /> Carregando checklists...</div>
                                        ) : (
                                            <div className="analysis-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {technicalAnalyses.map(analise => (
                                                    <div key={analise.id} className={`review-item-card ${analise.conformidade === 'não conforme' ? 'not-ok' : 'ok'}`} style={{
                                                        border: '1px solid #edf2f7',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        background: analise.conformidade === 'não conforme' ? '#fffafa' : '#ffffff'
                                                    }}>
                                                        <div className="review-item-header" style={{
                                                            padding: '1rem',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            background: analise.conformidade === 'não conforme' ? '#fff5f5' : '#f8fafc'
                                                        }}>
                                                            <div className="item-info">
                                                                <strong style={{ fontSize: '1rem', color: '#2d3748' }}>{analise.componente}</strong>
                                                                {(analise.dimensoes || analise.qtd) && (
                                                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px' }}>
                                                                        {analise.dimensoes && <span>{analise.dimensoes}</span>}
                                                                        {analise.dimensoes && analise.qtd && <span style={{ margin: '0 5px' }}>|</span>}
                                                                        {analise.qtd && <span>Qtd: {analise.qtd}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span style={{
                                                                padding: '0.25rem 0.6rem',
                                                                borderRadius: '4px',
                                                                background: analise.conformidade === 'conforme' ? '#c6f6d5' : '#fed7d7',
                                                                color: analise.conformidade === 'conforme' ? '#22543d' : '#822727',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                {analise.conformidade.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        {analise.conformidade === 'não conforme' && (
                                                            <div className="review-item-details" style={{ padding: '1rem', borderTop: '1px dashed #feb2b2' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                                    {analise.anomalias && (
                                                                        <div>
                                                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#e53e3e', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Anomalia Encontrada</label>
                                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568', background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>{analise.anomalias}</p>
                                                                        </div>
                                                                    )}
                                                                    {analise.solucao && (
                                                                        <div>
                                                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Solução Recomendada</label>
                                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568', background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{analise.solucao}</p>
                                                                        </div>
                                                                    )}
                                                                    {analise.fotos && analise.fotos.length > 0 && (
                                                                        <div>
                                                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Evidências Fotográficas</label>
                                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                                                {analise.fotos.map((f, i) => (
                                                                                    <img key={i} src={f} alt="Evidência" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => window.open(f, '_blank')} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pcp-approval-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => { handleApprove(selectedPeritagem.id); setSelectedPeritagem(null); }}
                                            style={{ flex: 1, padding: '1.2rem', background: '#3182ce', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(49, 130, 206, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                        >
                                            <Check size={24} /> Confirmar e Enviar para Comercial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filtered.map(p => (
                                <div key={p.id} className="pcp-action-card" style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }} onClick={() => setSelectedPeritagem(p)}>
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
                                            <Search size={18} /> Ver Detalhes e Aprovar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
                {!loading && filtered.length === 0 && !selectedPeritagem && <p style={{ textAlign: 'center', color: '#718096' }}>Nenhuma peritagem pendente.</p>}
            </div>
        </div>
    );
};
