import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 10;

export default function DataTable({ columns, data, searchKeys }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const filtered = useMemo(() => {
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(row =>
            searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
        );
    }, [data, search, searchKeys]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sortKey]; const vb = b[sortKey];
            const diff = isNaN(va) ? String(va).localeCompare(String(vb)) : va - vb;
            return sortDir === 'asc' ? diff : -diff;
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleSort(key) {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(1);
    }

    function handleSearch(e) {
        setSearch(e.target.value);
        setPage(1);
    }

    return (
        <div>
            <div className="table-toolbar">
                <label className="search-input">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={handleSearch}
                    />
                </label>
                <span className="table-count">
                    {filtered.length} de {data.length} registros
                </span>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => handleSort(col.key)}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {col.label}
                                        {sortKey === col.key
                                            ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                            : null}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length === 0 ? (
                            <tr><td colSpan={columns.length} className="empty-state">No se encontraron registros</td></tr>
                        ) : (
                            pageData.map((row, i) => (
                                <tr key={i}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                            <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                                {p}
                            </button>
                        );
                    })}
                    <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
            )}
        </div>
    );
}
