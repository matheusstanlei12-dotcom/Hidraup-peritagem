import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, FileDown } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
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
    fotos_montagem?: string[];
    fotos_videos_teste?: string[];
    foto_pintura_final?: string;
    databook_pronto?: boolean;
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

const pdfStyles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#ffffff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1 solid #005696', paddingBottom: 10 },
    logo: { width: 100 },
    title: { fontSize: 18, color: '#005696', fontWeight: 'bold' },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 12, backgroundColor: '#f1f5f9', padding: 5, color: '#005696', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 },
    row: { flexDirection: 'row', borderBottom: '0.5 solid #e2e8f0', padding: 5 },
    label: { width: '30%', fontSize: 9, color: '#64748b' },
    value: { width: '70%', fontSize: 9, color: '#1e293b', fontWeight: 'bold' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#005696', color: '#ffffff', padding: 5, fontSize: 8 },
    tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #e2e8f0', padding: 5, fontSize: 8 },
    col1: { width: '5%' },
    col2: { width: '25%' },
    col3: { width: '15%' },
    col4: { width: '15%' },
    col5: { width: '15%' },
    col6: { width: '25%' },
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    imageCard: { width: '48%', marginBottom: 10 },
    image: { width: '100%', height: 150, objectFit: 'cover', borderRadius: 5 },
    imageLabel: { fontSize: 8, textAlign: 'center', marginTop: 3, color: '#64748b' },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: 5,
    },
    footerText: {
        fontSize: 7,
        color: '#94a3b8',
    }
});

const DatabookPDF = ({ peritagem, itens }: { peritagem: PeritagemData, itens: AnaliseItem[] }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <Image src="/logo.png" style={pdfStyles.logo} />
                <View>
                    <Text style={pdfStyles.title}>DATABOOK TÉCNICO</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>OS: {peritagem.os_interna || peritagem.os}</Text>
                </View>
            </View>

            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>1. Informações Gerais</Text>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Cliente:</Text><Text style={pdfStyles.value}>{peritagem.cliente}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>TAG:</Text><Text style={pdfStyles.value}>{peritagem.tag || '-'}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Local:</Text><Text style={pdfStyles.value}>{peritagem.local_equipamento || '-'}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>NI:</Text><Text style={pdfStyles.value}>{peritagem.ni || '-'}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Pedido:</Text><Text style={pdfStyles.value}>{peritagem.numero_pedido || '-'}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Responsável:</Text><Text style={pdfStyles.value}>{peritagem.responsavel_tecnico || '-'}</Text></View>
            </View>

            <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>2. Itens e Medidas</Text>
                <View style={pdfStyles.tableHeader}>
                    <Text style={pdfStyles.col1}>#</Text>
                    <Text style={pdfStyles.col2}>Componente</Text>
                    <Text style={pdfStyles.col3}>Ø Int.</Text>
                    <Text style={pdfStyles.col4}>Ø Ext.</Text>
                    <Text style={pdfStyles.col5}>Status</Text>
                    <Text style={pdfStyles.col6}>Anomalia</Text>
                </View>
                {itens.map((item, idx) => (
                    <View key={item.id} style={pdfStyles.tableRow}>
                        <Text style={pdfStyles.col1}>{idx + 1}</Text>
                        <Text style={pdfStyles.col2}>{item.componente}</Text>
                        <Text style={pdfStyles.col3}>{item.diametro_interno_encontrado || '-'}</Text>
                        <Text style={pdfStyles.col4}>{item.diametro_externo_encontrado || '-'}</Text>
                        <Text style={pdfStyles.col5}>{item.conformidade?.toUpperCase()}</Text>
                        <Text style={pdfStyles.col6}>{item.anomalias || '-'}</Text>
                    </View>
                ))}
            </View>

            <View style={pdfStyles.section} break>
                <Text style={pdfStyles.sectionTitle}>3. Registro Fotográfico (Peritagem)</Text>
                <View style={pdfStyles.imageGrid}>
                    {peritagem.foto_frontal && (
                        <View style={pdfStyles.imageCard}>
                            <Image src={peritagem.foto_frontal} style={pdfStyles.image} />
                            <Text style={pdfStyles.imageLabel}>Vista Geral</Text>
                        </View>
                    )}
                    {itens.map(item => item.fotos?.slice(0, 1).map((foto, fIdx) => (
                        <View key={`${item.id}-${fIdx}`} style={pdfStyles.imageCard}>
                            <Image src={foto} style={pdfStyles.image} />
                            <Text style={pdfStyles.imageLabel}>{item.componente}</Text>
                        </View>
                    )))}
                </View>
            </View>
        </Page>

        {(peritagem.fotos_montagem?.length || 0) > 0 && (
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.sectionTitle}>4. Montagem e Recuperação</Text>
                <View style={pdfStyles.imageGrid}>
                    {peritagem.fotos_montagem?.map((foto, idx) => (
                        <View key={idx} style={pdfStyles.imageCard}>
                            <Image src={foto} style={pdfStyles.image} />
                            <Text style={pdfStyles.imageLabel}>Montagem {idx + 1}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        )}

        {(peritagem.fotos_videos_teste?.length || 0) > 0 && (
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.sectionTitle}>5. Testes de Qualidade</Text>
                <View style={pdfStyles.imageGrid}>
                    {peritagem.fotos_videos_teste?.filter(url => !url.toLowerCase().endsWith('.mp4')).map((foto, idx) => (
                        <View key={idx} style={pdfStyles.imageCard}>
                            <Image src={foto} style={pdfStyles.image} />
                            <Text style={pdfStyles.imageLabel}>Teste {idx + 1}</Text>
                        </View>
                    ))}
                </View>
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 10 }}>* Vídeos de teste disponíveis no portal online.</Text>
            </Page>
        )}

        {peritagem.foto_pintura_final && (
            <Page size="A4" style={pdfStyles.page}>
                <Text style={pdfStyles.sectionTitle}>6. Pintura e Acabamento Final</Text>
                <View style={{ alignItems: 'center' }}>
                    <Image src={peritagem.foto_pintura_final} style={{ width: '100%', height: 400, objectFit: 'contain' }} />
                    <Text style={pdfStyles.imageLabel}>Equipamento Pronto</Text>
                </View>
            </Page>
        )}
        <View style={pdfStyles.footer} fixed>
            <Text style={pdfStyles.footerText}>Acesso Exclusivo via Databook Digital</Text>
            <Text style={{ fontSize: 6, color: '#94a3b8', marginTop: 2 }}>Documento gerado automaticamente pela www.trusttecnologia.com.br</Text>
        </View>
    </Document>
);

export const PublicReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [peritagem, setPeritagem] = useState<PeritagemData | null>(null);
    const [itens, setItens] = useState<AnaliseItem[]>([]);
    const [downloading, setDownloading] = useState(false);
    const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

    useEffect(() => {
        if (id) {
            fetchReportData(id);
        }
    }, [id]);

    useEffect(() => {
        if (!loading && peritagem && !autoDownloadStarted) {
            setAutoDownloadStarted(true);
            setTimeout(() => {
                handleDownloadDatabook();
            }, 1000);
        }
    }, [loading, peritagem, autoDownloadStarted]);

    const handleDownloadDatabook = async () => {
        if (!peritagem || !itens.length) return;
        setDownloading(true);
        try {
            const blob = await pdf(<DatabookPDF peritagem={peritagem} itens={itens} />).toBlob();
            const url = URL.createObjectURL(blob);

            // Tenta abrir o visualizador de PDF do navegador
            window.location.href = url;

            // Backup/Download forçado se o browser não abrir o PDF
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = `DATABOOK_${peritagem.os_interna || peritagem.tag}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 1000);

        } catch (error) {
            console.error('Erro ao gerar databook:', error);
        } finally {
            setDownloading(false);
        }
    };

    const fetchReportData = async (reportId: string) => {
        try {
            setLoading(true);
            const { data: pData, error: pError } = await supabase
                .from('peritagens')
                .select('*')
                .eq('id', reportId)
                .maybeSingle();

            if (pError || !pData) throw pError || new Error('Relatório não encontrado');

            setPeritagem(pData as any);

            const { data: aData, error: aError } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', reportId);

            if (aError) throw aError;

            const compItems = aData ? aData.filter(i => i.tipo === 'componente' || !i.tipo) : [];
            setItens(compItems);

        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
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
            </div>
        );
    }

    return (
        <div className="public-report-container download-mode">
            <div className="download-center">
                <div className="brand-logo">
                    <img src="/logo.png" alt="HIDRAUP" />
                </div>

                <div className="status-container">
                    <Loader2 className="animate-spin" size={48} color="#1a2e63" />
                    <h2>Baixando Relatório Digital</h2>
                    <p>O seu Databook está sendo gerado e o download iniciará automaticamente em instantes.</p>
                </div>

                {!downloading && autoDownloadStarted && (
                    <div className="manual-download-box">
                        <p>O download não iniciou automaticamente?</p>
                        <button className="btn-manual" onClick={handleDownloadDatabook}>
                            <FileDown size={20} /> CLIQUE AQUI PARA BAIXAR
                        </button>
                    </div>
                )}

                <footer className="simple-footer">
                    <p>Tecnologia Trust Tecnologia</p>
                    <p className="footer-url">www.trusttecnologia.com.br</p>
                </footer>
            </div>
        </div>
    );
};
