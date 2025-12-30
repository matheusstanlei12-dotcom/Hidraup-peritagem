import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    FileText,
    DollarSign,
    Wrench,
    CheckCircle2
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
    const navigate = useNavigate();
    const { role } = useAuth();
    const [counts, setCounts] = React.useState({
        total: 0,
        aguardando: 0,
        manutencao: 0,
        finalizados: 0,
        pendentePcp: 0,
        aguardandoCliente: 0,
        conferenciaFinal: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('status');

            if (error) throw error;

            if (data) {
                const total = data.length;
                const pendentePcp = data.filter(p => p.status === 'AGUARDANDO APROVAÇÃO DO PCP' || p.status === 'PERITAGEM CRIADA').length;
                const aguardandoCliente = data.filter(p => p.status === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || p.status === 'Aguardando Clientes').length;
                const manutencao = data.filter(p => p.status === 'EM MANUTENÇÃO' || p.status === 'Cilindros em Manutenção').length;
                const conferenciaFinal = data.filter(p => p.status === 'AGUARDANDO CONFERÊNCIA FINAL').length;
                const finalizados = data.filter(p => p.status === 'PROCESSO FINALIZADO' || p.status === 'Finalizados' || p.status === 'ORÇAMENTO FINALIZADO').length;

                setCounts({ total, aguardando: aguardandoCliente, manutencao, finalizados, pendentePcp, aguardandoCliente, conferenciaFinal });
            }
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: '1. Aprovar Peritagem',
            value: counts.pendentePcp,
            icon: <FileText size={32} color="#3182ce" />,
            color: '#ebf8ff',
            link: '/pcp/aprovar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: '2. Liberar Pedido',
            value: counts.aguardandoCliente,
            icon: <DollarSign size={32} color="#ed8936" />,
            color: '#fffaf0',
            link: '/pcp/liberar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: '3. Conferência Final',
            value: counts.conferenciaFinal,
            icon: <CheckCircle2 size={32} color="#2d3748" />,
            color: '#edf2f7',
            link: '/pcp/finalizar',
            show: role === 'pcp' || role === 'gestor'
        },
        {
            label: 'Em Manutenção',
            value: counts.manutencao,
            icon: <Wrench size={32} color="#38a169" />,
            color: '#f0fff4',
            link: '/monitoramento',
            show: true
        },
        {
            label: 'Finalizados',
            value: counts.finalizados,
            icon: <CheckCircle2 size={32} color="#48bb78" />,
            color: '#f0fff4',
            link: '/monitoramento',
            show: true
        },
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
        labels: ['Finalizados', 'PCP Aprovação', 'Liberação Pedido', 'Oficina', 'Conferência'],
        datasets: [
            {
                data: [counts.finalizados, counts.pendentePcp, counts.aguardandoCliente, counts.manutencao, counts.conferenciaFinal],
                backgroundColor: ['#48bb78', '#3182ce', '#ed8936', '#ecc94b', '#2d3748'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Painel de Controle HIDRAUP</h1>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>
            ) : (
                <div className="stats-grid">
                    {stats.filter(s => s.show).map((stat, index) => (
                        <div
                            key={index}
                            className="stat-card clickable"
                            style={{ backgroundColor: '#ffffff', cursor: 'pointer' }}
                            onClick={() => navigate(stat.link)}
                        >
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
            )}

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
