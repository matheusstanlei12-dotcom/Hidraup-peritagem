import React from 'react';
import { Search, FileText, Download } from 'lucide-react';
import './Relatorios.css';

export const Relatorios: React.FC = () => {
    return (
        <div className="relatorios-container">
            <h1 className="page-title">Central de Relatórios PDF</h1>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input type="text" placeholder="Buscar peritagem por cliente ou ID para gerar relatório..." />
                </div>
            </div>

            <div className="report-list">
                <div className="report-card">
                    <div className="report-info">
                        <h3 className="report-title">teste <span className="report-id">#6f2b831e</span></h3>
                        <span className="report-details">teste - 29/12/2025</span>
                        <span className="status-badge small">Aguardando Compras</span>
                    </div>

                    <div className="report-actions">
                        <button className="btn-outline">
                            <FileText size={18} />
                            <span>PDF Sem Custo</span>
                        </button>
                        <button className="btn-outline">
                            <FileText size={18} />
                            <span>PDF Comprador</span>
                        </button>
                        <button className="btn-outline">
                            <FileText size={18} />
                            <span>PDF Orçamentista</span>
                        </button>
                        <button className="btn-primary" style={{ width: 'auto' }}>
                            <Download size={18} />
                            <span>PDF Cliente</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
