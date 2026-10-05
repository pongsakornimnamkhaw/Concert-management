import { effectiveFeatureAccess, type BackofficeFeature } from '@/features/auth/access/backofficeAccess';
import { getEmployeeSession } from '@/features/auth/utils/employeeSession';

export function useFeatureAccess(feature: BackofficeFeature) {
  const session = getEmployeeSession();
  const level = session ? effectiveFeatureAccess(session.role, session.jobRole, session.department, feature) : 'none';
  return { level, canView: level === 'view' || level === 'edit', canEdit: level === 'edit' };
}
