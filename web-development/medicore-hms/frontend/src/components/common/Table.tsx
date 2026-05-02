import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  rowKey?: keyof T;
}

function Table<T extends Record<string, any>>({
  data, columns, onEdit, onDelete, onView, loading = false,
  emptyMessage = 'No data available', currentPage = 1, totalPages = 1,
  onPageChange, totalItems, rowKey = '_id' as keyof T,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const handleSort = useCallback((key: string) => {
    setSort(prev => prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }, []);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av === bv) return 0;
      if (av == null) return 1; if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const hasActions = onEdit || onDelete || onView;

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr>{columns.map(c => <th key={String(c.key)}>{c.label}</th>)}</tr></thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                {columns.map((c, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
                {hasActions && <td className="px-4 py-3"><div className="skeleton h-4 w-16 rounded" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</div>;
  }

  const pageNums = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="data-table" role="table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} style={col.width ? { width: col.width } : {}}>
                  {col.sortable ? (
                    <button onClick={() => handleSort(String(col.key))} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors group">
                      {col.label}
                      <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors">
                        {sort?.key === String(col.key)
                          ? sort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                      </span>
                    </button>
                  ) : col.label}
                </th>
              ))}
              {hasActions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={String(item[rowKey] ?? idx)} onClick={() => onView && onView(item)} className={onView ? 'cursor-pointer' : ''}>
                {columns.map(col => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(item[col.key as keyof T], item) : String(item[col.key as keyof T] ?? '—')}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <button onClick={() => onView(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 mt-0">
          {totalItems && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages} · {totalItems} total
            </p>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNums().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400"><MoreHorizontal className="w-4 h-4" /></span>
              ) : (
                <button
                  key={p} onClick={() => onPageChange(p as number)}
                  className={`w-7 h-7 rounded-lg text-xs font-600 transition-colors ${
                    currentPage === p
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Table) as typeof Table;
