import React, { useState, useEffect } from 'react';
import { Download, Loader2, Search } from 'lucide-react';

import { pdf } from '@react-pdf/renderer';
import { UsiminasReportTemplate } from '../components/UsiminasReportTemplate';
import { ReportTemplate } from '../components/ReportTemplate';
import { supabase } from '../lib/supabase';
import { generateTechnicalOpinion } from '../lib/reportUtils';
import { useAuth } from '../contexts/AuthContext';
import './ClientPeritagens.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    data_execucao: string;
    status: string;
    os_interna?: string;
}

export const ClientPeritagens: React.FC = () => {
    const { user } = useAuth();
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [clienteNome, setClienteNome] = useState<string>('');
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClienteData();
    }, [user]);

    useEffect(() => {
        if (empresaId) {
            fetchPeritagens();
        }
    }, [empresaId]);

    const fetchClienteData = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('empresa_id, empresas(nome)')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data?.empresa_id) {
                setEmpresaId(data.empresa_id);
                // @ts-ignore
                setClienteNome(data.empresas?.nome || '');
            }
        } catch (err) {
            console.error('Erro ao buscar dados do cliente:', err);
        }
    };



    const fetchPeritagens = async () => {
        if (!empresaId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro ao buscar peritagens:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (peritagem: any) => {
        setGeneratingPdf(true);
        setSelectedId(peritagem.id);

        try {
            const { data: analise } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', peritagem.id);

            const parecer = generateTechnicalOpinion(peritagem, analise || []);

            const reportData = {
                laudoNum: String(peritagem.numero_peritagem || ''),
                numero_os: String(peritagem.os_interna || peritagem.numero_peritagem || ''),
                data: new Date().toLocaleDateString('pt-BR'),
                hora: peritagem.data_execucao ? new Date(peritagem.data_execucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                local_equipamento: String(peritagem.local_equipamento || 'OFICINA'),
                equipamento: String(peritagem.equipamento || 'CILINDRO HIDRÁULICO'),
                tag: String(peritagem.tag || 'N/A'),
                cliente: String(peritagem.cliente || ''),
                nota_fiscal: String(peritagem.nota_fiscal || ''),
                ni: String(peritagem.ni || ''),
                pedido: String(peritagem.numero_pedido || ''),
                camisa_ext: String(peritagem.camisa_ext || ''),
                haste_comp: String(peritagem.haste_comp || ''),
                camisa_int: String(peritagem.camisa_int || ''),
                camisa_comp: String(peritagem.camisa_comp || ''),
                haste_diam: String(peritagem.haste_diam || ''),
                curso: String(peritagem.curso || ''),
                responsavel_tecnico: String(peritagem.responsavel_tecnico || ''),
                logo_trusteng: '/logo.png',
                itens: (analise || [])
                    .filter((i: any) => i.conformidade === 'não conforme')
                    .map((i: any, idx: number) => ({
                        id: idx + 1,
                        desc: String(i.componente || ''),
                        quantidade: String(i.qtd || '1'),
                        avaria: String(i.anomalias || ''),
                        recuperacao: String(i.solucao || ''),
                        conformidade: String(i.conformidade || 'conforme'),
                        foto: i.fotos && i.fotos.length > 0 ? i.fotos[0] : undefined
                    })),
                items: (analise || [])
                    .filter((i: any) => i.tipo !== 'vedação')
                    .map((i: any, idx: number) => ({
                        id: idx + 1,
                        descricao: String(i.componente || ''),
                        qtd: String(i.qtd || '1'),
                        dimensoes: String(i.dimensoes || '-'),
                        conformidade: String(i.conformidade || ''),
                        selecionado: i.conformidade === 'não conforme',
                        anomalias: i.anomalias,
                        solucao: i.solucao,
                        fotos: i.fotos || []
                    })),
                vedacoes: (analise || [])
                    .filter((i: any) => i.tipo === 'vedação' && i.conformidade === 'não conforme')
                    .map((i: any) => ({
                        descricao: String(i.componente || ''),
                        qtd: String(i.qtd || '1'),
                        unidade: 'UN',
                        observacao: String(i.anomalias || ''),
                        conformidade: String(i.conformidade || 'não conforme'),
                        selecionado: true
                    })),
                parecer_tecnico: String(parecer || ''),
                parecerTecnico: String(parecer || ''),
                foto_frontal: peritagem.foto_frontal,
                desenho_conjunto: String(peritagem.desenho_conjunto || '-'),
                tipo_modelo: String(peritagem.tipo_modelo || '-'),
                fabricante: String(peritagem.fabricante || '-'),
                lubrificante: String(peritagem.lubrificante || '-'),
                volume: String(peritagem.volume || '-'),
                acoplamento_polia: String(peritagem.acoplamento_polia || 'NÃO'),
                sistema_lubrificacao: String(peritagem.sistema_lubrificacao || 'NÃO'),
                outros_especificar: String(peritagem.outros_especificar || '-'),
                observacoes_gerais: String(peritagem.observacoes_gerais || '-'),
                area: String(peritagem.area || '-'),
                linha: String(peritagem.linha || '-')
            };

            const isUsiminas = reportData.cliente.toUpperCase().includes('USIMINAS');
            const template = isUsiminas
                ? <UsiminasReportTemplate data={reportData} />
                : <ReportTemplate data={reportData} />;

            const blob = await pdf(template).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = isUsiminas
                ? `Peritagem Usiminas_${reportData.laudoNum}.pdf`
                : `PERITAGEM_${reportData.laudoNum}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao baixar PDF:', err);
            alert('Erro ao gerar o arquivo PDF.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const filteredPeritagens = peritagens.filter(p =>
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.os_interna && p.os_interna.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="client-peritagens-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#2d3748" />
            </div>
        );
    }

    return (
        <div className="peritagens-container">
            <div className="header-actions">
                <h1 className="page-title">Relatórios</h1>
                <p className="page-subtitle" style={{ color: '#64748b', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                    {clienteNome || 'Sua Empresa'}
                </p>
            </div>

            <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por O.S ou Número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table className="peritagens-table">
                    <thead>
                        <tr>
                            <th>O.S / Referência</th>
                            <th>Data da Execução</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPeritagens.map((p) => (
                            <tr key={p.id}>
                                <td className="peritagem-id">
                                    <span style={{ fontWeight: 'bold', display: 'block' }}>{p.os_interna || 'SEM O.S'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#718096' }}>Ref: {p.numero_peritagem}</span>
                                </td>
                                <td>{new Date(p.data_execucao).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <span className={`status-badge ${p.status.toLowerCase().replace(/ /g, '-')}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        className="btn-download-client"
                                        onClick={() => handleDownloadPdf(p)}
                                        disabled={generatingPdf && selectedId === p.id}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.8rem',
                                            width: 'auto',
                                            margin: '0 auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {generatingPdf && selectedId === p.id ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                        {generatingPdf && selectedId === p.id ? 'GERANDO...' : 'BAIXAR PDF'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {peritagens.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                                    Nenhuma peritagem encontrada para sua empresa.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
