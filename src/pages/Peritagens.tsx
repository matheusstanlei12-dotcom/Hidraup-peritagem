import React, { useState } from 'react';
import { Search, Plus, ExternalLink } from 'lucide-react';
import './Peritagens.css';

interface Peritagem {
    id: string;
    cliente: string;
    data: string;
    status: string;
    prioridade: string;
}

export const Peritagens: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const peritagens: Peritagem[] = [
        { id: '#6f2b831e', cliente: 'teste', data: '29/12/2025', status: 'Aguardando Compras', prioridade: 'Normal' },
    ];

    return (
        <div className="peritagens-container">
            <div className="header-actions">
                <h1 className="page-title">Todas as Peritagens</h1>
                <button className="btn-primary" style={{ width: 'auto' }}>
                    <Plus size={20} />
                    <span>Nova Peritagem</span>
                </button>
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="peritagens-table">
                    <thead>
                        <tr>
                            <th>Número da Peritagem</th>
                            <th>Cliente</th>
                            <th>Data da Execução</th>
                            <th>Status</th>
                            <th>Prioridade</th>
                            <th>Verificar Análise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {peritagens.map((p) => (
                            <tr key={p.id}>
                                <td className="peritagem-id">{p.id}</td>
                                <td>{p.cliente}</td>
                                <td>{p.data}</td>
                                <td>
                                    <span className={`status-badge ${p.status.toLowerCase().replace(/ /g, '-')}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td>{p.prioridade}</td>
                                <td>
                                    <button className="btn-action">
                                        <span>ABRIR</span>
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
