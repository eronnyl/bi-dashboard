import { useMemo } from 'react';
import { BarChart2, AlertTriangle, TrendingDown, Package } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useRendimiento } from '../hooks/useRendimiento';
import { useCostos } from '../hooks/useCostos';
import KPICard from '../components/KPICard';

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

function fmt(n, decimals = 0) {
    return Number(n).toLocaleString('es-VE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMoney(n) {
    return '$' + fmt(n, 2);
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: p.color }}>
                    {p.name}: <strong>{fmt(p.value, 2)}</strong>
                </p>
            ))}
        </div>
    );
};

export default function DashboardPage() {
    const { data: rendData, isLoading: rLoad, isError: rErr } = useRendimiento();
    const { data: costData, isLoading: cLoad, isError: cErr } = useCostos();

    const kpiRend = useMemo(() => {
        if (!rendData?.length) return null;
        const totalMerma = rendData.reduce((s, r) => s + r.total_merma, 0);
        const totalReq = rendData.reduce((s, r) => s + r.total_requerido, 0);
        const pct = totalReq > 0 ? ((totalMerma / totalReq) * 100).toFixed(1) : '0.0';
        return { totalMerma, pct };
    }, [rendData]);

    const kpiCost = useMemo(() => {
        if (!costData?.length) return null;
        const totalCosto = costData.reduce((s, r) => s + r.costo_total, 0);
        const totalSobre = costData.reduce((s, r) => s + r.costo_sobretiempos, 0);
        const totalExtras = costData.reduce((s, r) => s + r.total_horas_extras, 0);
        return { totalCosto, totalSobre, totalExtras };
    }, [costData]);

    const top5Rend = useMemo(() => rendData?.slice(0, 5) || [], [rendData]);
    const top5Cost = useMemo(() => {
        if (!costData) return [];
        return costData
            .slice(0, 5)
            .map(r => ({
                name: r.codigo_empleado,
                normal: r.costo_total - r.costo_sobretiempos,
                extras: r.costo_sobretiempos,
            }));
    }, [costData]);

    const loading = rLoad || cLoad;

    if (loading) {
        return (
            <div>
                <div className="kpi-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" />)}
                </div>
                <div className="chart-grid">
                    <div className="skeleton skeleton-chart" />
                    <div className="skeleton skeleton-chart" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Resumen Ejecutivo</div>
                <div className="page-desc">Indicadores clave de producción — Laboratorios Bjarner</div>
            </div>

            <div className="kpi-grid">
                <KPICard
                    label="Total Merma Materiales"
                    value={kpiRend ? fmt(kpiRend.totalMerma, 0) : '—'}
                    icon={TrendingDown}
                    color="var(--color-danger)"
                    colorBg="rgba(239,68,68,0.1)"
                    footer="Acumulado de todos los productos"
                />
                <KPICard
                    label="% Merma sobre Requerido"
                    value={kpiRend ? `${kpiRend.pct}%` : '—'}
                    icon={AlertTriangle}
                    color="var(--color-warning)"
                    colorBg="rgba(245,158,11,0.1)"
                    footer="Relación merma / cantidad requerida"
                />
                <KPICard
                    label="Costo Nómina Total"
                    value={kpiCost ? fmtMoney(kpiCost.totalCosto) : '—'}
                    icon={BarChart2}
                    color="var(--color-primary)"
                    colorBg="rgba(59,130,246,0.1)"
                    footer="Suma de horas normales y extras"
                />
                <KPICard
                    label="Costo Sobretiempos"
                    value={kpiCost ? fmtMoney(kpiCost.totalSobre) : '—'}
                    icon={Package}
                    color="var(--color-purple)"
                    colorBg="rgba(139,92,246,0.1)"
                    footer={kpiCost ? `${fmt(kpiCost.totalExtras, 0)} horas extras acumuladas` : ''}
                />
            </div>

            <div className="chart-grid">
                {/* Top 5 Mermas */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top 5 Productos — Mayor Merma</div>
                            <div className="card-subtitle">Merma total acumulada por producto</div>
                        </div>
                    </div>
                    {rErr ? (
                        <div className="error-state">
                            <div className="error-icon">✕</div>
                            <p>Error conectando al backend. Verifica que el servidor esté en línea.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={top5Rend} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis
                                    type="category"
                                    dataKey="nombre_producto"
                                    width={130}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={v => v?.length > 18 ? v.slice(0, 18) + '…' : v}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total_merma" name="Merma" fill="#ef4444" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Distribución Costos */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top 5 Empleados — Distribución de Costos</div>
                            <div className="card-subtitle">Normal vs Sobretiempos ($)</div>
                        </div>
                    </div>
                    {cErr ? (
                        <div className="error-state">
                            <div className="error-icon">✕</div>
                            <p>Error conectando al backend. Verifica que el servidor esté en línea.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={top5Cost} margin={{ left: 0, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                                <Bar dataKey="normal" name="Costo Normal" fill="#3b82f6" stackId="a" />
                                <Bar dataKey="extras" name="Sobretiempos" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
