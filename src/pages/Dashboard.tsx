import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    FileText,
    DollarSign,
    Wrench,
    CheckCircle2,
    Timer
} from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, user } = useAuth();
    const [counts, setCounts] = React.useState({
        total: 0,
        aguardando: 0,
        manutencao: 0,
        finalizados: 0,
        pendentePcp: 0,
        aguardandoCliente: 0,
        conferenciaFinal: 0,
        avgLeadTime: 0
    });
    const [clientStats, setClientStats] = React.useState<{ name: string; count: number }[]>([]);
    const [monthlyAvgData, setMonthlyAvgData] = React.useState<{ month: string; avg: number }[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user) fetchCounts();
    }, [user]);

    interface DashboardData {
        status: string;
        cliente: string;
        created_at?: string;
        updated_at?: string;
    }

    const fetchCounts = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .returns<DashboardData[]>();

            if (error) throw error;

            if (data) {
                const total = data.length;
                const pendentePcp = data.filter((p: DashboardData) => p.status === 'AGUARDANDO APROVAÇÃO DO PCP' || p.status === 'PERITAGEM CRIADA').length;
                const aguardandoCliente = data.filter((p: DashboardData) => p.status === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || p.status === 'Aguardando Clientes').length;
                const manutencao = data.filter((p: DashboardData) => p.status === 'EM MANUTENÇÃO' || p.status === 'Cilindros em Manutenção').length;
                const conferenciaFinal = data.filter((p: DashboardData) => p.status === 'AGUARDANDO CONFERÊNCIA FINAL').length;

                // Identify finished items
                const finishedItems = data.filter((p: DashboardData) =>
                    p.status === 'PROCESSO FINALIZADO' ||
                    p.status === 'Finalizados' ||
                    p.status === 'ORÇAMENTO FINALIZADO'
                );
                const finalizados = finishedItems.length;

                // Calculate Global Average Lead Time
                let totalDays = 0;
                let validItems = 0;

                // Calculate Monthly Averages
                const monthGroups: { [key: string]: { total: number, count: number } } = {};

                finishedItems.forEach((item: DashboardData) => {
                    if (item.created_at && item.updated_at) {
                        const start = new Date(item.created_at);
                        const end = new Date(item.updated_at);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        totalDays += diffDays;
                        validItems++;

                        // Group by Month (Format: MM/YYYY)
                        const monthKey = end.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
                        if (!monthGroups[monthKey]) {
                            monthGroups[monthKey] = { total: 0, count: 0 };
                        }
                        monthGroups[monthKey].total += diffDays;
                        monthGroups[monthKey].count += 1;
                    }
                });

                const avgLeadTime = validItems > 0 ? Math.round(totalDays / validItems) : 0;

                // Sort columns by date
                const sortedMonths = Object.keys(monthGroups).sort((a, b) => {
                    const [ma, ya] = a.split('/').map(Number);
                    const [mb, yb] = b.split('/').map(Number);
                    return new Date(ya, ma - 1).getTime() - new Date(yb, mb - 1).getTime();
                }).map(month => ({
                    month,
                    avg: Math.round(monthGroups[month].total / monthGroups[month].count)
                }));

                setMonthlyAvgData(sortedMonths);
                setCounts({ total, aguardando: aguardandoCliente, manutencao, finalizados, pendentePcp, aguardandoCliente, conferenciaFinal, avgLeadTime });

                // Processar estatísticas por cliente
                const clientCounts: { [key: string]: number } = {};
                data.forEach((p: DashboardData) => {
                    // Normalizar nomes: remover espaços e converter para maiúsculo
                    const clientName = p.cliente?.trim().toUpperCase() || 'SEM CLIENTE';
                    clientCounts[clientName] = (clientCounts[clientName] || 0) + 1;
                });

                const sortedClients = Object.entries(clientCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                setClientStats(sortedClients);
            }
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: '1. Aprovação de Peritagem',
            value: counts.pendentePcp,
            icon: <FileText size={24} />,
            color: 'rgba(59, 130, 246, 0.15)',
            iconColor: '#3b82f6',
            link: '/pcp/aprovar',
            show: isAdmin
        },
        {
            label: '2. Liberação do Pedido',
            value: counts.aguardandoCliente,
            icon: <DollarSign size={24} />,
            color: 'rgba(245, 158, 11, 0.15)',
            iconColor: '#f59e0b',
            link: '/pcp/liberar',
            show: isAdmin
        },
        {
            label: '3. Conferência Final',
            value: counts.conferenciaFinal,
            icon: <CheckCircle2 size={24} />,
            color: 'rgba(15, 17, 42, 0.1)',
            iconColor: '#0f172a',
            link: '/pcp/finalizar',
            show: isAdmin
        },
        {
            label: 'Em Manutenção',
            value: counts.manutencao,
            icon: <Wrench size={24} />,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: '#10b981',
            link: '/monitoramento',
            show: true
        },
        {
            label: 'Finalizados',
            value: counts.finalizados,
            icon: <CheckCircle2 size={24} />,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: '#10b981',
            link: '/monitoramento',
            show: true
        },
        {
            label: 'Tempo Médio (Dias)',
            value: counts.avgLeadTime,
            icon: <Timer size={24} />,
            color: 'rgba(99, 102, 241, 0.15)',
            iconColor: '#6366f1',
            link: '#',
            show: true
        },
    ];

    // Plugin para desenhar o texto no centro do Doughnut
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart: any) => {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            const total = chart.config.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);

            ctx.font = '800 2.5rem sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#334155'; // Slate 700
            ctx.fillText(total.toString(), width / 2, height / 2 + 10);

            ctx.font = 'bold 0.7rem sans-serif';
            ctx.fillStyle = '#94a3b8'; // Slate 400
            ctx.fillText('TOTAL PERITAGENS', width / 2, height / 2 + 35);
            ctx.restore();
        }
    };

    // Plugin para desenhar valores no final das barras
    const valueAtEndPlugin = {
        id: 'valueAtEnd',
        afterDatasetsDraw: (chart: any) => {
            const { ctx } = chart;
            const isHorizontal = chart.config.options.indexAxis === 'y';

            chart.data.datasets.forEach((dataset: any, i: number) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar: any, index: number) => {
                    const value = dataset.data[index];
                    if (value === 0) return;

                    ctx.save();
                    ctx.fillStyle = '#64748b'; // Slate 500
                    ctx.font = 'bold 11px sans-serif';

                    if (isHorizontal) {
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(value, bar.x + 8, bar.y);
                    } else {
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(value, bar.x, bar.y - 5);
                    }
                    ctx.restore();
                });
            });
        }
    };

    const barData = {
        labels: clientStats.length > 0 ? clientStats.map(s => s.name) : ['Sem dados'],
        datasets: [
            {
                label: 'Peritagens',
                data: clientStats.length > 0 ? clientStats.map(s => s.count) : [0],
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
                    gradient.addColorStop(0, '#3b82f6');
                    gradient.addColorStop(1, '#60a5fa');
                    return gradient;
                },
                borderRadius: 6,
                borderWidth: 0,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            },
        ],
    };

    const doughnutData = {
        labels: ['Finalizados', 'PCP Aprovação', 'Liberação Pedido', 'Oficina', 'Conferência'],
        datasets: [
            {
                data: [counts.finalizados, counts.pendentePcp, counts.aguardandoCliente, counts.manutencao, counts.conferenciaFinal],
                backgroundColor: [
                    '#059669', // Industrial Green
                    '#2563eb', // Engineering Blue
                    '#d97706', // Warning Orange
                    '#db2777', // Workshop Pink
                    '#1e293b'  // Dark Navy
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10,
                spacing: 2,
                borderRadius: 2
            },
        ],
    };

    const lineData = {
        labels: monthlyAvgData.length > 0 ? monthlyAvgData.map(d => d.month) : ['Sem dados'],
        datasets: [
            {
                label: 'Tempo Médio (Dias)',
                data: monthlyAvgData.length > 0 ? monthlyAvgData.map(d => d.avg) : [0],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                tension: 0.4,
                fill: true,
                pointStyle: 'circle',
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const barOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                right: 40, // Espaço para o valor no final da barra
                left: 10,
                bottom: 10,
                top: 10
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#ffffff',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                titleFont: { size: 13, weight: 'bold' as any },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: '#f1f5f9',
                    drawTicks: false
                },
                ticks: {
                    stepSize: 5, // Aumentar o passo para evitar poluição
                    maxTicksLimit: 12, // Limitar quantidade de números no fundo
                    font: { size: 10, weight: 'bold' as any },
                    color: '#64748b'
                },
                border: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: { size: 10, weight: '600' as any },
                    color: '#475569',
                    autoSkip: false
                },
                border: { display: false }
            }
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart' as any
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: {
                position: 'right' as any,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rectRounded', // Softer feel
                    padding: 15,
                    font: {
                        size: 11,
                        weight: '600' as any
                    },
                    color: '#475569'
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { weight: 'bold' as any }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: false,
            duration: 1000
        }
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { weight: 'bold' as any }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#475569' }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Painel de Controle</h1>
            <p className="page-subtitle">Bem-vindo ao sistema HIDRAUP. Veja o resumo das atividades.</p>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                    <span className="loading-spinner"></span> Carregando estatísticas...
                </div>
            ) : (
                <div className="stats-grid">
                    {stats.filter(s => s.show).map((stat, index) => (
                        <div
                            key={index}
                            className="stat-card clickable"
                            onClick={() => navigate(stat.link)}
                        >
                            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.color, color: stat.iconColor }}>
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
                    <h3>Quantidade de Peritagens por Cliente</h3>
                    <div className="chart-wrapper">
                        <div style={{ height: `${Math.max(300, clientStats.length * 40)}px`, width: '100%', paddingBottom: '20px' }}>
                            <Bar
                                data={barData}
                                options={barOptions}
                                plugins={[valueAtEndPlugin]}
                            />
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Distribuição por Status</h3>
                    <div className="doughnut-wrapper">
                        <Doughnut
                            data={doughnutData}
                            options={doughnutOptions}
                            plugins={[centerTextPlugin]}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Tempo Médio de Liberação (Mensal)</h3>
                    <div className="chart-wrapper">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};
