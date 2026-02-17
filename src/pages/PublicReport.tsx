import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import './PublicReport.css';

interface PeritagemData {
    id: string;
    tag: string;
    cliente: string;
    os_interna: string;
    os: string;
    numero_peritagem: string;
    ni: string;
    numero_pedido: string;
    nota_fiscal: string;
    data_execucao: string;
    local_equipamento: string;
    responsavel_tecnico: string;
    camisa_int: string;
    camisa_ext: string;
    camisa_comp: string;
    haste_diam: string;
    haste_comp: string;
    curso: string;
    desenho_conjunto: string;
    area: string;
    linha: string;
    tipo_modelo: string;
    foto_frontal: string;
}

interface AnaliseItem {
    id: string;
    componente: string;
    diametro_interno_encontrado: string;
    diametro_interno_especificado: string;
    diametro_externo_encontrado: string;
    diametro_externo_especificado: string;
    anomalias: string;
    solucao: string;
    fotos: string[];
    desvio_interno?: string;
    desvio_externo?: string;
    conformidade: string;
}

export const PublicReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [peritagem, setPeritagem] = useState<PeritagemData | null>(null);
    const [itens, setItens] = useState<AnaliseItem[]>([]);

    useEffect(() => {
        if (id) {
            console.log('Buscando relatório:', id);
            fetchReportData(id);
        }
    }, [id]);

    const fetchReportData = async (reportId: string) => {
        try {
            setLoading(true);
            const { data: pData, error: pError } = await supabase
                .from('peritagens')
                .select('*')
                .eq('id', reportId)
                .maybeSingle(); // Usar maybeSingle para evitar erro se não encontrar

            if (pError) {
                console.error('Erro Supabase Peritagem:', pError);
                throw pError;
            }

            if (!pData) {
                console.warn('Nenhuma peritagem encontrada com ID:', reportId);
                setPeritagem(null);
                return;
            }

            setPeritagem(pData as any);

            const { data: aData, error: aError } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', reportId);

            if (aError) {
                console.error('Erro Supabase Itens:', aError);
                throw aError;
            }

            const compItems = aData ? aData.filter(i => i.tipo === 'componente' || !i.tipo) : [];
            setItens(compItems);

        } catch (error) {
            console.error('Erro fatal ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="report-loading">
                <Loader2 className="animate-spin" size={48} color="#2563eb" />
                <p>Carregando Relatório Técnico...</p>
            </div>
        );
    }

    if (!peritagem) {
        return (
            <div className="report-error">
                <AlertCircle size={64} color="#ef4444" />
                <h1>Relatório não encontrado</h1>
                <p>O link acessado pode estar expirado ou o ID é inválido.</p>
                <code style={{ fontSize: '0.7rem', color: '#666' }}>ID: {id}</code>
            </div>
        );
    }

    // Identificar melhor a OS para exibir no badge
    const displayOS = peritagem.os_interna || peritagem.numero_peritagem || peritagem.os || peritagem.tag;

    return (
        <div className="public-report-container">
            <header className="report-header">
                <div className="header-logo">
                    <img src="/logo.png" alt="HIDRAUP Logo" />
                </div>
                <div className="header-info">
                    <h1>LAUDO TÉCNICO DE PERITAGEM</h1>
                    <span className="os-badge">OS: {displayOS}</span>
                </div>
            </header>

            <main className="report-content">
                <section className="report-section">
                    <h2 className="section-title">INFORMAÇÕES DO MATERIAL</h2>
                    <div className="engineering-grid">
                        <div className="grid-item">
                            <label>FORNECEDOR</label>
                            <span>HIDRAUP SERV. HID. E PNEU.</span>
                        </div>
                        <div className="grid-item">
                            <label>Nº PEDIDO COMPRA</label>
                            <span>{peritagem.numero_pedido || '-'}</span>
                        </div>
                        <div className="grid-item">
                            <label>Nº LAUDO USIMINAS</label>
                            <span>{peritagem.os_interna || '-'}</span>
                        </div>
                        <div className="grid-item">
                            <label>TAG DO EQUIPAMENTO</label>
                            <span>{peritagem.tag || '-'}</span>
                        </div>
                        <div className="grid-item">
                            <label>NI</label>
                            <span>{peritagem.ni || '-'}</span>
                        </div>
                    </div>
                </section>

                <section className="report-section">
                    <h2 className="section-title">RELAÇÃO DOS ITENS RECUPERADOS E MEDIDAS</h2>
                    <div className="table-wrapper">
                        <table className="engineering-table">
                            <thead>
                                <tr>
                                    <th>ITEM</th>
                                    <th>DESCRIÇÃO DO ITEM</th>
                                    <th>Ø INT. ENC.</th>
                                    <th>Ø INT. ESPEC.</th>
                                    <th>Ø EXT. ENC.</th>
                                    <th>Ø EXT. ESPEC.</th>
                                    <th>DESVIO</th>
                                    <th>CONFORMIDADE</th>
                                    <th>OBSERVAÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>{item.componente}</td>
                                        <td>{item.diametro_interno_encontrado ? `${item.diametro_interno_encontrado} mm` : '-'}</td>
                                        <td>{item.diametro_interno_especificado ? `${item.diametro_interno_especificado} mm` : '-'}</td>
                                        <td>{item.diametro_externo_encontrado ? `${item.diametro_externo_encontrado} mm` : '-'}</td>
                                        <td>{item.diametro_externo_especificado ? `${item.diametro_externo_especificado} mm` : '-'}</td>
                                        <td>{item.desvio_interno || item.desvio_externo || '-'}</td>
                                        <td className={item.conformidade === 'conforme' ? 'text-success' : 'text-danger'}>
                                            {item.conformidade?.toUpperCase()}
                                        </td>
                                        <td>{item.anomalias || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="report-section compact">
                    <h2 className="section-title">CURSO DO CILINDRO</h2>
                    <div className="engineering-grid col-2">
                        <div className="grid-item">
                            <label>ESPECIFICADO</label>
                            <span>{peritagem.curso || '-'}</span>
                        </div>
                        <div className="grid-item">
                            <label>ENCONTRADO</label>
                            <span>{peritagem.curso || '-'}</span>
                        </div>
                    </div>
                </section>

                <section className="report-section">
                    <h2 className="section-title">FOTOS DO REPARO</h2>
                    <div className="report-photos">
                        {peritagem.foto_frontal && (
                            <div className="photo-card featured">
                                <img src={peritagem.foto_frontal} alt="Foto Frontal" />
                                <span className="photo-label">VISTA GERAL DO EQUIPAMENTO</span>
                            </div>
                        )}
                        {itens.flatMap(i => i.fotos || []).map((foto, idx) => (
                            <div className="photo-card" key={idx}>
                                <img src={foto} alt={`Foto ${idx}`} />
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="report-footer">
                <p>Documento oficial Hidraup - {new Date().getFullYear()}</p>
                <div className="footer-stamps">
                    <span>GERADO VIA SISTEMA</span>
                    <span>SINCRONIZADO SUPABASE</span>
                </div>
            </footer>
        </div>
    );
};
