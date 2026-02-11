import React, { useState } from 'react';
import { QrCode as QrCodeIcon, ClipboardCopy, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const QrCodePage: React.FC = () => {
    const [qrValue, setQrValue] = useState('https://trusttecnologia.com.br');

    const handleCopy = () => {
        navigator.clipboard.writeText(qrValue);
        alert('Copiado para a área de transferência!');
    };

    const downloadQRCode = () => {
        const svg = document.getElementById('qr-code-svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `qrcode-${Date.now()}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>Gerar QR Code</h1>
                <p style={{ color: '#718096' }}>Gere QR codes para acesso rápido ao sistema ou links externos.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#4a5568' }}>Conteúdo do QR Code</label>
                        <textarea
                            value={qrValue}
                            onChange={(e) => setQrValue(e.target.value)}
                            placeholder="Digite a URL ou texto aqui..."
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                minHeight: '120px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <ClipboardCopy size={18} />
                            Copiar Link
                        </button>
                        <button
                            onClick={downloadQRCode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#3182ce',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Download size={18} />
                            Baixar PNG
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: '#f7fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <QRCodeSVG
                        id="qr-code-svg"
                        value={qrValue}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                    <div style={{ marginTop: '16px', color: '#718096', fontSize: '0.875rem', textAlign: 'center' }}>
                        Visualização em tempo real
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px', padding: '24px', background: '#ebf8ff', borderRadius: '12px', color: '#2c5282' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <QrCodeIcon size={24} />
                    <h3 style={{ fontWeight: 700 }}>Dica de Uso</h3>
                </div>
                <p>Cole a URL do sistema ou de uma inspeção específica para que os técnicos possam acessar rapidamente através de adesivos fixados nos equipamentos.</p>
            </div>
        </div>
    );
};
