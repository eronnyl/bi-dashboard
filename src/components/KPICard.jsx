export default function KPICard({ label, value, icon: Icon, color, colorBg, footer }) {
    return (
        <div className="kpi-card" style={{ '--kpi-color': color, '--kpi-color-bg': colorBg }}>
            <div className="kpi-header">
                <span className="kpi-label">{label}</span>
                {Icon && (
                    <div className="kpi-icon">
                        <Icon size={18} />
                    </div>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            {footer && <div className="kpi-footer">{footer}</div>}
        </div>
    );
}
