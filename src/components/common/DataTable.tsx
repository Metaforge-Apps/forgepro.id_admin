import React, { useState, useMemo, ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { TableSkeleton } from './Skeleton';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  align?: 'left' | 'center' | 'right';
  stickyRight?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
}

/**
 * Reusable DataTable Component (Fase 0: 0.4)
 * Mendukung scroll horizontal dengan kolom aksi sticky di kanan, sorting, paginasi,
 * pilih baris (checkbox), skeleton loading, state kosong, dan state error.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle,
  emptyDescription,
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
  selectable = false,
  selectedKeys,
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortAccessor) return data;
    const accessor = col.sortAccessor;
    return [...data].sort((a, b) => {
      const valA = accessor(a);
      const valB = accessor(b);
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const handleToggleAll = () => {
    if (!onSelectionChange || !selectedKeys) return;
    const pageKeys = pagedData.map((r) => rowKey(r));
    const allSelected = pageKeys.every((k) => selectedKeys.has(k));
    const next = new Set(selectedKeys);
    if (allSelected) {
      pageKeys.forEach((k) => next.delete(k));
    } else {
      pageKeys.forEach((k) => next.add(k));
    }
    onSelectionChange(next);
  };

  const handleToggleRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  if (error) {
    return <ErrorState description={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
              {selectable && (
                <th className="pb-3 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      pagedData.length > 0 &&
                      pagedData.every((r) => selectedKeys?.has(rowKey(r)))
                    }
                    onChange={handleToggleAll}
                    className="w-3.5 h-3.5 accent-[#D9B06F] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`pb-3 px-3 first:pl-0 last:pr-0 ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-content-primary' : ''} ${
                    col.stickyRight
                      ? 'sticky right-0 bg-surface-card z-10'
                      : ''
                  } ${col.className || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? (
                        <ChevronUp className="w-3 h-3 text-[#D9B06F]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[#D9B06F]" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60">
            {pagedData.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors ${
                    onRowClick ? 'hover:bg-surface-hover/50 cursor-pointer' : ''
                  }`}
                >
                  {selectable && (
                    <td
                      className="py-3.5 pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selectedKeys?.has(key))}
                        onChange={() => handleToggleRow(key)}
                        className="w-3.5 h-3.5 accent-[#D9B06F] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-3 first:pl-0 last:pr-0 ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      } ${
                        col.stickyRight
                          ? 'sticky right-0 bg-surface-card group-hover:bg-surface-hover transition-colors z-10'
                          : ''
                      } ${col.className || ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {sortedData.length > pageSizeOptions[0] && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle/60 text-xs text-content-muted">
          <div className="flex items-center gap-2">
            <span>Menampilkan {pagedData.length} dari {sortedData.length} baris</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-surface-card border border-border-subtle text-content-primary text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-hover disabled:opacity-40 text-content-primary font-medium"
            >
              Sebelumnya
            </button>
            <span className="px-2">
              Hal {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-hover disabled:opacity-40 text-content-primary font-medium"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
