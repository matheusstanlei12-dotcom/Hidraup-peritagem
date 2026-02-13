import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';
import './PcpCommon.css';

interface ItemAguardando {
    id: string;
    os_interna: string;
    cliente: string;
    data_chegada: string;
    status: string;
}

export const AguardandoPeritagem: React.FC = () => {
    const { role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [itens, setItens] = useState<ItemAguardando[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [osInterna, setOsInterna] = useState('');
    const [cliente, setCliente] = useState('');
    const [dataChegada, setDataChegada] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!osInterna || !cliente || !dataChegada) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('aguardando_peritagem')
                .insert([{
                    os_interna: osInterna,
                    cliente: cliente,
                    data_chegada: dataChegada,
                    status: 'AGUARDANDO'
                }]);

            if (error) throw error;

            alert('Item adicionado com sucesso!');
            setOsInterna('');
            setCliente('');
            setShowForm(false);
            fetchItens();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar item.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Deseja realmente excluir este item?')) return;

        try {
            const { error } = await supabase
                .from('aguardando_peritagem')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItens(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('Erro ao deletar item.');
        }
    };

    const filtered = itens.filter(item =>
        item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.os_interna.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <div className="header-section">
                <h1 className="page-title">Aguardando Peritagem</h1>
                {role === 'pcp' || role === 'gestor' ? (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
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

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Adicionar Cilindro para Peritagem</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Ordem de Serviço Interna</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        value={osInterna}
                                        onChange={(e) => setOsInterna(e.target.value)}
                                        placeholder="Ex: 8450"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Cliente</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        value={cliente}
                                        onChange={(e) => setCliente(e.target.value)}
                                        placeholder="Nome do Cliente"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Data de Chegada</label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                        value={dataChegada}
                                        onChange={(e) => setDataChegada(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-report-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button type="submit" className="btn-report-primary" disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="pcp-approval-grid">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#2563eb" />
                        <p>Carregando itens...</p>
                    </div>
                ) : (
                    filtered.map(item => (
                        <div key={item.id} className="pcp-action-card">
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
                                <div className="report-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <Calendar size={16} />
                                    <span style={{ fontSize: '0.85rem' }}>Chegada: {new Date(item.data_chegada).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            {(role === 'pcp' || role === 'gestor') && (
                                <div className="pcp-footer" style={{ marginTop: '15px' }}>
                                    <button
                                        className="btn-report-outline"
                                        style={{ width: '100%', color: '#ef4444', borderColor: '#fee2e2' }}
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 size={16} />
                                        <span>Excluir</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Nenhum cilindro aguardando peritagem.
                </div>
            )}
        </div>
    );
};
