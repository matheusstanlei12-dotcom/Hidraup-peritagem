import React from 'react';
import { QrCode } from 'lucide-react';

export const QrCodePage: React.FC = () => {
    return (
        <div style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
        }}>
            <div style={{
                background: '#f7fafc',
                padding: '48px',
                borderRadius: '24px',
                border: '2px dashed #e2e8f0',
                maxWidth: '400px'
            }}>
                <QrCode size={64} color="#3182ce" style={{ marginBottom: '24px', opacity: 0.5 }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748', marginBottom: '12px' }}>
                    Gerador de QR Code
                </h1>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                    Esta funcionalidade está sendo preparada para o ambiente de produção.
                    Em breve você poderá gerar códigos para seus equipamentos aqui.
                </p>
            </div>
        </div>
    );
};
