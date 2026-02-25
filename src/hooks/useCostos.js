import { useQuery } from '@tanstack/react-query';
import { getCostos } from '../api/client';

export function useCostos() {
    return useQuery({
        queryKey: ['costos'],
        queryFn: async () => {
            const json = await getCostos();
            return json.data.map(r => ({
                ...r,
                total_horas_normales: parseFloat(r.total_horas_normales) || 0,
                total_horas_extras: parseFloat(r.total_horas_extras) || 0,
                costo_sobretiempos: parseFloat(r.costo_sobretiempos) || 0,
                costo_total: parseFloat(r.costo_total) || 0,
            }));
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}
