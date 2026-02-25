import { useState, useMemo } from 'react';
import { BarChart3, TrendingDown, Package, AlertCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { useRendimiento } from '../hooks/useRendimiento';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';

function fmt(n, d = 2) {
    return Number(n).toLocaleString('es-VE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
                    {p.name}: <strong>{fmt(p.value)}</strong>
                </p>
            ))}
        </div>
    );
};

const TABLE_COLS = [
    { key: 'nombre_producto', label: 'Producto' },
    {
        key: 'total_requerido', label: 'Requerido',
        render: v => fmt(v)
    },
    {
        key: 'total_real', label: 'Real',
        render: v => fmt(v)
    },
    {
        key: 'total_merma', label: 'Merma',
        render: (v) => {
            const cls = v > 1000 ? 'badge-danger' : v > 100 ? 'badge-warning' : 'badge-success';
            return <span className={`badge ${cls}`}>{fmt(v)}</span>;
        }
    },
    {
        key: 'pct_merma', label: '% Merma',
        render: v => {
            const n = parseFloat(v);
            const cls = n > 10 ? 'badge-danger' : n > 5 ? 'badge-warning' : 'badge-success';
            return <span className={`badge ${cls}`}>{v}%</span>;
        }
    },
];

export default function RendimientoPage() {
    const { data, isLoading, isError } = useRendimiento();
    const [topN, setTopN] = useState(10);

    const kpis = useMemo(() => {
        if (!data?.length) return null;
        const totalMerma = data.reduce((s, r) => s + r.total_merma, 0);
        const totalReq = data.reduce((s, r) => s + r.total_requerido, 0);
        const pct = totalReq > 0 ? ((totalMerma / totalReq) * 100).toFixed(1) : '0.0';
        const peor = data[0];
        return { totalMerma, pct, peor, total: data.length };
    }, [data]);

    const chartData = useMemo(() => {
        if (!data) return [];
        return data.slice(0, topN).map(r => ({
            name: r.nombre_producto?.length > 20 ? r.nombre_producto.slice(0, 20) + '…' : r.nombre_producto,
            fullName: r.nombre_producto,
            requerido: r.total_requerido,
            real: r.total_real,
            merma: r.total_merma,
        }));
    }, [data, topN]);

    if (isLoading) {
        return (
            <div>
                <div className="kpi-grid">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}
                </div>
                <div className="skeleton skeleton-chart" style={{ marginBottom: 20 }} />
                <div className="skeleton skeleton-chart" />
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
                <div className="page-title">Rendimiento de Materiales</div>
                <div className="page-desc">Análisis de mermas productivas por producto — {kpis?.total} productos registrados</div>
            </div>

            <div className="kpi-grid">
                <KPICard
                    label="Merma Total Acumulada"
                    value={kpis ? fmt(kpis.totalMerma, 0) : '—'}
                    icon={TrendingDown}
                    color="var(--color-danger)"
                    colorBg="rgba(239,68,68,0.1)"
                    footer="Suma de mermas de todos los productos"
                />
                <KPICard
                    label="% Merma Global"
                    value={kpis ? `${kpis.pct}%` : '—'}
                    icon={BarChart3}
                    color="var(--color-warning)"
                    colorBg="rgba(245,158,11,0.1)"
                    footer="Merma / Cantidad requerida total"
                />
                <KPICard
                    label="Producto Más Afectado"
                    value={kpis?.peor ? fmt(kpis.peor.total_merma, 0) : '—'}
                    icon={Package}
                    color="var(--color-purple)"
                    colorBg="rgba(139,92,246,0.1)"
                    footer={kpis?.peor?.nombre_producto?.slice(0, 30)}
                />
            </div>

            {/* Gráfico principal */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Requerido vs Real vs Merma</div>
                        <div className="card-subtitle">Comparación de cantidades por producto</div>
                    </div>
                    <select
                        className="select-control"
                        value={topN}
                        onChange={e => setTopN(Number(e.target.value))}
                    >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={9999}>Todos</option>
                    </select>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ left: 0, right: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            angle={-30}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }} />
                        <Bar dataKey="requerido" name="Requerido" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="real" name="Real" fill="#10b981" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="merma" name="Merma" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tabla detalle */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Detalle por Producto</div>
                        <div className="card-subtitle">Datos completos ordenados por merma descendente</div>
                    </div>
                </div>
                <DataTable
                    columns={TABLE_COLS}
                    data={data || []}
                    searchKeys={['nombre_producto']}
                />
            </div>
        </div>
    );
}
