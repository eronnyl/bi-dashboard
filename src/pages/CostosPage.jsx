import { useMemo } from 'react';
import { Wallet, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer
} from 'recharts';
import { useCostos } from '../hooks/useCostos';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';

function fmt(n, d = 2) {
    return Number(n).toLocaleString('es-VE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtMoney(n) {
    return '$' + fmt(n, 2);
}

const PIE_COLORS = ['#CC9B34', '#A77927', '#d4890a', '#e0b84a', '#8C6420', '#f0c060', '#6aad5e'];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
        <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{p.name}</p>
            <p style={{ fontSize: 12, color: p.payload?.fill || p.color }}>
                Sobretiempos: <strong>{fmtMoney(p.value)}</strong>
            </p>
        </div>
    );
};

const TABLE_COLS = [
    { key: 'codigo_empleado', label: 'Empleado' },
    { key: 'total_horas_normales', label: 'H. Normales', render: v => fmt(v, 1) },
    {
        key: 'total_horas_extras', label: 'H. Extras', render: v => {
            const cls = v > 40 ? 'badge-danger' : v > 20 ? 'badge-warning' : 'badge-success';
            return <span className={`badge ${cls}`}>{fmt(v, 1)}</span>;
        }
    },
    {
        key: 'costo_sobretiempos', label: 'Sobretiempos', render: v => {
            const cls = v > 500 ? 'badge-danger' : v > 200 ? 'badge-warning' : 'badge-success';
            return <span className={`badge ${cls}`}>{fmtMoney(v)}</span>;
        }
    },
    { key: 'costo_total', label: 'Costo Total', render: v => <strong style={{ color: 'var(--color-text)' }}>{fmtMoney(v)}</strong> },
];

export default function CostosPage() {
    const { data, isLoading, isError } = useCostos();

    const kpis = useMemo(() => {
        if (!data?.length) return null;
        const totalCosto = data.reduce((s, r) => s + r.costo_total, 0);
        const totalSobre = data.reduce((s, r) => s + r.costo_sobretiempos, 0);
        const totalNormal = totalCosto - totalSobre;
        const totalExtras = data.reduce((s, r) => s + r.total_horas_extras, 0);
        const pctSobre = totalCosto > 0 ? ((totalSobre / totalCosto) * 100).toFixed(1) : '0';
        return { totalCosto, totalSobre, totalNormal, totalExtras, pctSobre, total: data.length };
    }, [data]);

    const pieData = useMemo(() => {
        if (!data) return [];
        return data
            .filter(r => r.costo_sobretiempos > 0)
            .slice(0, 7)
            .map(r => ({ name: r.codigo_empleado, value: r.costo_sobretiempos }));
    }, [data]);

    const barData = useMemo(() => {
        if (!data) return [];
        return data.slice(0, 10).map(r => ({
            name: r.codigo_empleado,
            normal: parseFloat((r.costo_total - r.costo_sobretiempos).toFixed(2)),
            extras: parseFloat(r.costo_sobretiempos.toFixed(2)),
        }));
    }, [data]);

    if (isLoading) {
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

    if (isError) {
        return (
            <div className="error-state" style={{ marginTop: 80 }}>
                <div className="error-icon"><AlertCircle size={24} /></div>
                <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>No se pudo cargar el reporte</p>
                <p>Verifica que el backend ETL esté corriendo en <code>http://localhost:3000</code></p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Costos Laborales</div>
                <div className="page-desc">Sobretiempos y nómina por empleado — {kpis?.total} empleados registrados</div>
            </div>

            <div className="kpi-grid">
                <KPICard
                    label="Costo Total Nómina"
                    value={kpis ? fmtMoney(kpis.totalCosto) : '—'}
                    icon={Wallet}
                    color="var(--color-accent)"
                    colorBg="rgba(167,121,39,0.1)"
                    footer="Horas normales + sobretiempos"
                />
                <KPICard
                    label="Costo Horas Normales"
                    value={kpis ? fmtMoney(kpis.totalNormal) : '—'}
                    icon={Clock}
                    color="var(--color-success)"
                    colorBg="rgba(106,173,94,0.1)"
                    footer="Jornada regular de trabajo"
                />
                <KPICard
                    label="Costo Sobretiempos"
                    value={kpis ? fmtMoney(kpis.totalSobre) : '—'}
                    icon={TrendingUp}
                    color="var(--color-danger)"
                    colorBg="rgba(201,79,79,0.1)"
                    footer={kpis ? `${kpis.pctSobre}% del costo total` : ''}
                />
                <KPICard
                    label="Total Horas Extras"
                    value={kpis ? fmt(kpis.totalExtras, 0) : '—'}
                    icon={Clock}
                    color="var(--color-warning)"
                    colorBg="rgba(212,137,10,0.1)"
                    footer="Suma 25% + 50% + 100%"
                />
            </div>

            <div className="chart-grid">
                {/* Pie Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Distribución Sobretiempos</div>
                            <div className="card-subtitle">Top 7 empleados por costo de extras</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={55}
                                dataKey="value"
                                paddingAngle={3}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, color: '#a89060', paddingTop: 8 }}
                                formatter={(value) => value.length > 14 ? value.slice(0, 14) + '…' : value}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart apilado */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Normal vs Sobretiempos por Empleado</div>
                            <div className="card-subtitle">Top 10 empleados por costo total</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} margin={{ left: 0, right: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{label}</p>
                                        {payload.map((p, i) => (
                                            <p key={i} style={{ fontSize: 12, color: p.fill, marginBottom: 2 }}>
                                                {p.name}: <strong>{fmtMoney(p.value)}</strong>
                                            </p>
                                        ))}
                                    </div>
                                );
                            }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 4 }} />
                            <Bar dataKey="normal" name="Costo Normal" stackId="a" fill="#A77927" />
                            <Bar dataKey="extras" name="Sobretiempos" stackId="a" fill="#e0b84a" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabla */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Detalle por Empleado</div>
                        <div className="card-subtitle">Horas y costos desglosados por operario</div>
                    </div>
                </div>
                <DataTable
                    columns={TABLE_COLS}
                    data={data || []}
                    searchKeys={['codigo_empleado']}
                />
            </div>
        </div>
    );
}
