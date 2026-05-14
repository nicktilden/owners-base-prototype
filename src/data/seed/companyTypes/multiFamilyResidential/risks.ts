import type { Risk } from '@/types/health';

export const risks: Risk[] = [];

export function getRisksForProject(projectId: string): Risk[] {
  return risks.filter(r => r.projectId === projectId);
}
