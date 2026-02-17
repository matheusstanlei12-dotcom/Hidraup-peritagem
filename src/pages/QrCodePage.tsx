import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { Search, QrCode, Loader2, Calendar, FileDown, ExternalLink } from 'lucide-react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './QrCodePage.css';

interface PeritagemSummary {
    id: string;
    tag: string;
    os: string;
    cliente: string;
    created_at: string;
    os_interna?: string;
    numero_peritagem?: string;
}

// PDF Styles
const pdfStyles = StyleSheet.create({
    page: {
        backgroundColor: '#0f172a', // Fundo azul escuro futurista
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    container: {
        border: '1pt solid #38bdf8', // Borda neon azul
        borderRadius: 20,
        padding: 40,
        width: '100%',
        height: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    // Elementos decorativos futuristas (cantos)
    cornerTopLeft: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 40,
        height: 40,
        borderTop: '4pt solid #3b82f6',
        borderLeft: '4pt solid #3b82f6',
        borderTopLeftRadius: 20,
    },
    cornerTopRight: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 40,
        height: 40,
        borderTop: '4pt solid #3b82f6',
        borderRight: '4pt solid #3b82f6',
        borderTopRightRadius: 20,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 40,
        height: 40,
        borderBottom: '4pt solid #3b82f6',
        borderLeft: '4pt solid #3b82f6',
        borderBottomLeftRadius: 20,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 40,
        height: 40,
        borderBottom: '4pt solid #3b82f6',
        borderRight: '4pt solid #3b82f6',
        borderBottomRightRadius: 20,
    },
    logoContainer: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 40,
        width: 180,
        alignItems: 'center',
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        border: '2pt solid #38bdf8',
    },
    qrCode: {
        width: 320,
        height: 320,
    },
    scanInfo: {
        marginTop: 40,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#38bdf8',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    subLabel: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 8,
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        fontSize: 9,
        color: '#475569',
        letterSpacing: 1,
    }
});

// PDF Template Component
const QrCodePDF = ({ qrDataUrl }: { qrDataUrl: string }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.container}>
                {/* Detalhes de Interface Futurista */}
                <View style={pdfStyles.cornerTopLeft} />
                <View style={pdfStyles.cornerTopRight} />
                <View style={pdfStyles.cornerBottomLeft} />
                <View style={pdfStyles.cornerBottomRight} />

                <View style={pdfStyles.logoContainer}>
                    <Image src="/logo.png" style={{ width: 140 }} />
                </View>

                <View style={pdfStyles.qrWrapper}>
                    <Image src={qrDataUrl} style={pdfStyles.qrCode} />
                </View>

                <View style={pdfStyles.scanInfo}>
                    <Text style={pdfStyles.label}>INTERFACE DE ACESSO TÉCNICO</Text>
                    <Text style={pdfStyles.subLabel}>ESCANEIE PARA VISUALIZAR O LAUDO DIGITAL HIDRAUP</Text>
                </View>

                <Text style={pdfStyles.footer}>SISTEMA DE GESTÃO INTELIGENTE - TRUST TECNOLOGIA</Text>
            </View>
        </Page>
    </Document>
);

// Função para obter a URL base correta (evita localhost no QR Code)
const getBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
        // ATENÇÃO: Altere para o seu domínio real do Vercel ou domínio próprio
        return 'https://trusttecnologia.com.br';
    }
    return window.location.origin;
};

export const QrCodePage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [allPeritagens, setAllPeritagens] = useState<PeritagemSummary[]>([]);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [qrConfig, setQrConfig] = useState<{ id: string, tag: string } | null>(null);

    useEffect(() => {
        fetchAllPeritagens();
    }, []);

    const fetchAllPeritagens = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('peritagens')
                .select('id, tag, os, cliente, created_at, os_interna, numero_peritagem')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAllPeritagens(data || []);
        } catch (error) {
            console.error('Erro ao buscar peritagens:', error);
            alert('Erro ao carregar lista de peritagens.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePdf = async (peritagem: PeritagemSummary) => {
        setGeneratingId(peritagem.id);
        setQrConfig({ id: peritagem.id, tag: peritagem.tag });

        try {
            const generateDataUrl = (): Promise<string> => {
                return new Promise((resolve) => {
                    // Espera um pouco mais para garantir que a imagem do logo foi carregada no canvas
                    setTimeout(() => {
                        const canvasEl = document.getElementById('qr-canvas-hidden') as HTMLCanvasElement;
                        if (canvasEl) {
                            resolve(canvasEl.toDataURL('image/png'));
                        } else {
                            resolve('');
                        }
                    }, 500);
                });
            };

            const qrDataUrl = await generateDataUrl();
            if (!qrDataUrl) {
                alert('Erro ao gerar código QR. Tente novamente.');
                return;
            }

            const blob = await pdf(<QrCodePDF qrDataUrl={qrDataUrl} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR_CODE_${peritagem.tag.replace(/\s+/g, '_')}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF do QR Code.');
        } finally {
            setGeneratingId(null);
            setQrConfig(null);
        }
    };

    const filteredPeritagens = allPeritagens.filter(p =>
        (p.tag?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.cliente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.os_interna?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.os?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const baseUrl = getBaseUrl();

    return (
        <div className="qrcode-page">
            <div className="qrcode-header">
                <QrCode size={32} color="#005696" />
                <h1>Gerador de QR Code</h1>
                <p>Lista de todas as peritagens. Gere o QR Code em PDF para identificação do equipamento.</p>
                {window.location.hostname === 'localhost' && (
                    <div style={{ marginTop: 10, padding: '8px 16px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 8, color: '#9a3412', fontSize: '0.875rem' }}>
                        ⚠️ <strong>Modo Desenvolvimento:</strong> O QR Code apontará para <code>{baseUrl}</code>
                    </div>
                )}
            </div>

            <div className="search-section">
                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Filtrar por TAG, Cliente ou OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Loader2 className="animate-spin" size={40} color="#005696" />
                        <p>Carregando peritagens...</p>
                    </div>
                ) : (
                    <>
                        <div className="peritagens-grid">
                            {filteredPeritagens.length === 0 ? (
                                <div className="no-results">
                                    <p>Nenhuma peritagem encontrada.</p>
                                </div>
                            ) : (
                                filteredPeritagens.map(p => (
                                    <div key={p.id} className="peritagem-card">
                                        <div className="card-top">
                                            <div className="card-qr-preview">
                                                <QRCodeCanvas
                                                    value={`${baseUrl}/view-report/${p.id}`}
                                                    size={120}
                                                    level="H"
                                                    includeMargin={false}
                                                    imageSettings={{
                                                        src: "/app-icon.png",
                                                        x: undefined,
                                                        y: undefined,
                                                        height: 24,
                                                        width: 24,
                                                        excavate: true,
                                                    }}
                                                />
                                            </div>
                                            <div className="card-main">
                                                <div className="card-info">
                                                    <span className="card-tag">{p.tag}</span>
                                                    <span className="card-client">{p.cliente}</span>
                                                    <span className="card-os">OS: {p.os_interna || p.numero_peritagem || p.os || '-'}</span>
                                                </div>
                                                <div className="card-date">
                                                    <Calendar size={14} />
                                                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn-generate"
                                                onClick={() => handleGeneratePdf(p)}
                                                disabled={generatingId === p.id}
                                            >
                                                {generatingId === p.id ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <FileDown size={18} />
                                                )}
                                                Gerar QR Code
                                            </button>

                                            <a
                                                href={`/view-report/${p.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-view"
                                                title="Ver Laudo Online"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: 'none' }}>
                            {qrConfig && (
                                <QRCodeCanvas
                                    id="qr-canvas-hidden"
                                    value={`${baseUrl}/view-report/${qrConfig.id}`}
                                    size={1024}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/app-icon.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 220,
                                        width: 220,
                                        excavate: true,
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
