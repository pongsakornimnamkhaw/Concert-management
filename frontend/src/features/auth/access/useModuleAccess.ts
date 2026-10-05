import { getEmployeeSession } from '@/features/auth/utils/employeeSession';
import { effectiveModulePermissions, hasModuleAccess, type BackofficeModule } from '@/features/auth/access/backofficeAccess';

export function useModuleAccess(module: BackofficeModule) {
  const session = getEmployeeSession();
  if (!session) return { level: 'none' as const, canView: false, canEdit: false };
  const permissions = effectiveModulePermissions(session.role, session.department, session.modulePermissions, session.jobRole);
  return {
    level: permissions[module],
    canView: hasModuleAccess(permissions, module, 'view'),
    canEdit: hasModuleAccess(permissions, module, 'edit'),
  };
}
