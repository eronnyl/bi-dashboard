import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { triggerEtl } from '../api/client';

const PAGE_TITLES = {
    '/': { title: 'Dashboard General', subtitle: 'Resumen ejecutivo · Laboratorios Bjarner' },
    '/rendimiento': { title: 'Rendimiento de Materiales', subtitle: 'Análisis de mermas por producto' },
    '/costos': { title: 'Costos Laborales', subtitle: 'Sobretiempos y nómina por empleado' },
};

export default function Topbar() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [running, setRunning] = useState(false);
    const [toast, setToast] = useState(null);

    const { title, subtitle } = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

    const now = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

    const handleSync = useCallback(async () => {
        setRunning(true);
        try {
            await triggerEtl();
            setToast({ type: 'success', text: 'ETL iniciado en background. Los datos se actualizarán en minutos.' });
            setTimeout(() => queryClient.invalidateQueries(), 3000);
        } catch (e) {
            setToast({ type: 'error', text: 'No se pudo conectar al backend ETL.' });
        } finally {
            setRunning(false);
            setTimeout(() => setToast(null), 5000);
        }
    }, [queryClient]);

    const handleRefresh = () => {
        queryClient.invalidateQueries();
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left">
                    <div className="topbar-title">{title}</div>
                    <div className="topbar-subtitle">{subtitle}</div>
                </div>
                <div className="topbar-right">
                    <span className="last-refresh">Actualizado: {now}</span>
                    <button className="btn btn-ghost" onClick={handleRefresh} title="Refrescar datos">
                        <RotateCcw size={14} />
                        Refrescar
                    </button>
                    <button className="btn btn-primary" onClick={handleSync} disabled={running}>
                        <RefreshCw size={14} className={running ? 'spin' : ''} />
                        {running ? 'Iniciando...' : 'Sincronizar Datos'}
                    </button>
                </div>
            </div>

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    <span>{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.text}
                </div>
            )}
        </>
    );
}
