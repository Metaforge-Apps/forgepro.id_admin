import { useState, useEffect, useMemo, useCallback } from 'react';
import { packageController } from './package.controller';
import {
  PricingPackageItem,
  CreatePackagePayload,
  UpdatePackagePayload,
} from './package.types';

/**
 * React Hook untuk mengakses dan memanipulasi PackageController secara reaktif
 */
export function usePackageController() {
  const [packages, setPackages] = useState<PricingPackageItem[]>(() =>
    packageController.getAllPackages()
  );
  const [packageToDeactivate, setPackageToDeactivate] =
    useState<PricingPackageItem | null>(null);

  useEffect(() => {
    const unsubscribe = packageController.subscribe(() => {
      setPackages(packageController.getAllPackages());
    });
    return unsubscribe;
  }, []);

  const rules = useMemo(() => {
    return packageController.getRules();
  }, []);

  const handleConfirmDeactivate = useCallback(() => {
    if (packageToDeactivate) {
      packageController.deactivatePackage(packageToDeactivate.id);
      setPackageToDeactivate(null);
    }
  }, [packageToDeactivate]);

  const createPackage = useCallback((payload: CreatePackagePayload) => {
    return packageController.createPackage(payload);
  }, []);

  const updatePackage = useCallback(
    (id: string, payload: UpdatePackagePayload) => {
      return packageController.updatePackage(id, payload);
    },
    []
  );

  const deactivatePackage = useCallback((id: string) => {
    return packageController.deactivatePackage(id);
  }, []);

  const getPackageById = useCallback((id: string) => {
    return packageController.getPackageById(id);
  }, []);

  const getStatusBadgeStyle = useCallback((status: string) => {
    return packageController.getStatusBadgeStyle(status);
  }, []);

  return {
    packages,
    rules,
    packageToDeactivate,
    setPackageToDeactivate,
    handleConfirmDeactivate,
    createPackage,
    updatePackage,
    deactivatePackage,
    getPackageById,
    getStatusBadgeStyle,
  };
}

export default usePackageController;
