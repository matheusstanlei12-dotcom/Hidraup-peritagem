import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import './Monitoramento.css';

export const Monitoramento: React.FC = () => {
    return (
        <div className="monitoramento-container">
            <h1 className="page-title">Monitoramento de Processos</h1>
            <p className="page-subtitle">Selecione uma peritagem para visualizar a linha do tempo e o status atual.</p>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input type="text" placeholder="Buscar por orçamento ou cliente..." />
                </div>
            </div>

            <div className="process-list">
                <div className="process-card">
                    <div className="process-info">
                        <span className="process-tag">#teste</span>
                        <h3 className="process-title">teste</h3>
                        <span className="process-client">teste</span>
                    </div>
                    <div className="process-status-wrapper">
                        <span className="status-badge aguardando-compras">Aguardando Compras</span>
                        <ChevronRight size={20} color="#cbd5e0" />
                    </div>
                </div>
            </div>
        </div>
    );
};
