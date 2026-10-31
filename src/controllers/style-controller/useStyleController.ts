import { useState, useEffect, useMemo, useCallback } from 'react';
import { styleController } from './style.controller';
import {
  SuitStyleItem,
  SuitCategoryFilter,
  SuitStatusFilter,
  SuitSortOption,
  CreateSuitStylePayload,
  UpdateSuitStylePayload,
} from './style.types';

/**
 * React Hook untuk mengakses dan memanipulasi StyleController secara reaktif
 */
export function useStyleController() {
  const [suits, setSuits] = useState<SuitStyleItem[]>(() =>
    styleController.getAllStyles()
  );
  const [activeCategory, setActiveCategory] = useState<SuitCategoryFilter>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<SuitStatusFilter>('Semua status');
  const [sortBy, setSortBy] = useState<SuitSortOption>('Terbaru');
  const [suitToDelete, setSuitToDelete] = useState<SuitStyleItem | null>(null);

  useEffect(() => {
    const unsubscribe = styleController.subscribe(() => {
      setSuits(styleController.getAllStyles());
    });
    return unsubscribe;
  }, []);

  const filteredSuits = useMemo(() => {
    void suits;
    return styleController.getFilteredStyles({
      category: activeCategory,
      status: statusFilter,
      searchQuery,
      sortBy,
    });
  }, [suits, activeCategory, statusFilter, searchQuery, sortBy]);

  const categoryTabs = useMemo(() => {
    void suits;
    return styleController.getCategoryTabs();
  }, [suits]);

  const summary = useMemo(() => {
    void suits;
    return styleController.getSummary();
  }, [suits]);

  const handleToggleStatus = useCallback((id: string) => {
    return styleController.toggleStyleStatus(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (suitToDelete) {
      styleController.deleteStyle(suitToDelete.id);
      setSuitToDelete(null);
    }
  }, [suitToDelete]);

  const createStyle = useCallback((payload: CreateSuitStylePayload) => {
    return styleController.createStyle(payload);
  }, []);

  const updateStyle = useCallback((id: string, payload: UpdateSuitStylePayload) => {
    return styleController.updateStyle(id, payload);
  }, []);

  const getStyleById = useCallback((id: string) => {
    return styleController.getStyleById(id);
  }, []);

  const getStatusBadgeStyle = useCallback((status: string) => {
    return styleController.getStatusBadgeStyle(status);
  }, []);

  return {
    suits,
    filteredSuits,
    categoryTabs,
    summary,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    suitToDelete,
    setSuitToDelete,
    handleToggleStatus,
    handleConfirmDelete,
    createStyle,
    updateStyle,
    getStyleById,
    getStatusBadgeStyle,
  };
}

export default useStyleController;
