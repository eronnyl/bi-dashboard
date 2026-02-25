import { useQuery } from '@tanstack/react-query';
import { getRendimiento } from '../api/client';

export function useRendimiento() {
    return useQuery({
        queryKey: ['rendimiento'],
        queryFn: async () => {
            const json = await getRendimiento();
            return json.data.map(r => ({
                ...r,
                total_requerido: parseFloat(r.total_requerido) || 0,
                total_real: parseFloat(r.total_real) || 0,
                total_merma: parseFloat(r.total_merma) || 0,
                pct_merma: r.total_requerido > 0
                    ? ((parseFloat(r.total_merma) / parseFloat(r.total_requerido)) * 100).toFixed(1)
                    : '0.0',
            }));
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}
