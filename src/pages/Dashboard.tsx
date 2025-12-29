import React from 'react';
import {
    Hourglass,
    ShoppingCart,
    BadgeDollarSign,
    CheckCircle2,
    Building2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export const Dashboard: React.FC = () => {
    const stats = [
        { label: 'Em Andamento', value: 1, icon: <Hourglass size={32} color="#f6ad55" />, color: '#fffaf0' },
        { label: 'Aguardando Compras', value: 1, icon: <ShoppingCart size={32} color="#4299e1" />, color: '#ebf8ff' },
        { label: 'Aguardando Orçamento', value: 0, icon: <BadgeDollarSign size={32} color="#ed8936" />, color: '#fffaf0' },
        { label: 'Finalizados', value: 0, icon: <CheckCircle2 size={32} color="#48bb78" />, color: '#f0fff4' },
        { label: 'Clientes Ativos', value: 1, icon: <Building2 size={32} color="#a0aec0" />, color: '#edf2f7' },
    ];

    const barData = {
        labels: ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E'],
        datasets: [
            {
                label: 'Peritagens',
                data: [1, 0, 0, 0, 0],
                backgroundColor: '#1b7a3d',
                borderRadius: 4,
            },
        ],
    };

    const doughnutData = {
        labels: ['Finalizados', 'Em Andamento', 'Pendentes'],
        datasets: [
            {
                data: [0, 1, 0],
                backgroundColor: ['#48bb78', '#ecc94b', '#e53e3e'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Visão Geral do Sistema</h1>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ backgroundColor: '#ffffff' }}>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Peritagens por Cliente (Top 5)</h3>
                    <div className="chart-wrapper">
                        <Bar
                            data={barData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribuição por Status</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            usePointStyle: true,
                                            padding: 20
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
