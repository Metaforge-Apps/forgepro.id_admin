import { useState, useEffect, useCallback } from 'react';
import { voucherController } from './voucher.controller';
import { VoucherItem, VoucherInput } from './voucher.types';

/**
 * React Hook untuk mengakses dan memanipulasi VoucherController secara reaktif
 */
export function useVoucherController() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(() =>
    voucherController.getAllVouchers()
  );

  useEffect(() => {
    const unsubscribe = voucherController.subscribe(() => {
      setVouchers(voucherController.getAllVouchers());
    });
    return unsubscribe;
  }, []);

  const createVoucher = useCallback(
    (input: VoucherInput) => voucherController.createVoucher(input),
    []
  );

  const updateVoucher = useCallback(
    (id: string, input: VoucherInput) => voucherController.updateVoucher(id, input),
    []
  );

  const toggleActive = useCallback(
    (id: string) => voucherController.toggleActive(id),
    []
  );

  const deleteVoucher = useCallback(
    (id: string) => voucherController.deleteVoucher(id),
    []
  );

  const validate = useCallback(
    (input: VoucherInput, exceptId?: string) =>
      voucherController.validate(input, exceptId),
    []
  );

  return {
    vouchers,
    summary: voucherController.getSummary(),
    createVoucher,
    updateVoucher,
    toggleActive,
    deleteVoucher,
    validate,
    getStatusBadgeStyle: voucherController.getStatusBadgeStyle.bind(voucherController),
  };
}

export default useVoucherController;
