import React from 'react';
import { QrCode, ClipboardCopy } from 'lucide-react';

export const QrCodePage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Gerar QR Code</h1>
            <p>Página para gerar QR Codes em desenvolvimento.</p>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                marginTop: '20px',
                color: '#666'
            }}>
                <QrCode size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <span>Funcionalidade em breve</span>
            </div>
        </div>
    );
};
