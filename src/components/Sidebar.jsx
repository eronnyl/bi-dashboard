import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Wallet, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEtlStatus } from '../api/client';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rendimiento', icon: BarChart3, label: 'Rendimiento' },
    { to: '/costos', icon: Wallet, label: 'Costos Laborales' },
];

export default function Sidebar() {
    const { data: status } = useQuery({
        queryKey: ['etl-status'],
        queryFn: getEtlStatus,
        refetchInterval: 30000,
        retry: false,
    });

    const online = !!status;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/logo-icon.png" alt="Laboratorios Bjarner" className="logo-img" />
                <div>
                    <div className="logo-title">Bjarner BI</div>
                    <div className="logo-sub">Data Warehouse</div>
                </div>
            </div>

            <div className="sidebar-section">Reportes</div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={17} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="etl-badge">
                    <div className={`dot ${online ? '' : 'offline'}`} />
                    <span>API {online ? 'Online' : 'Offline'}</span>
                    <Activity size={13} style={{ marginLeft: 'auto' }} />
                </div>
            </div>
        </aside>
    );
}
