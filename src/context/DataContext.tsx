/**
 * DATA CONTEXT
 * Holds all seed data loaded at app root. Provides typed read access
 * throughout the component tree. No API calls — all data is static seed data.
 */

import React, { createContext, useContext, useState } from 'react';
import type { Account } from '@/types/account';
import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { WBSItem } from '@/types/shared';
import type { BudgetLineItem } from '@/types/budget';
import type { ScheduleEntry } from '@/types/schedule';
import type { Task } from '@/types/tasks';
import type { Document } from '@/types/documents';
import type { Asset } from '@/types/assets';
import type { ActionPlan } from '@/types/action_plans';
import type { Hub } from '@/types/hubs';
import type { Rfi } from '@/types/rfis';
import type { SpecificationDivision } from '@/types/specifications';
import type { RiskTag, ManualRiskItem, ConnectedProjectHealth, HealthSnapshot, Incident, WorkHours } from '@/types/health';
import type { Observation } from '@/types/observations';
import type { Submittal } from '@/types/submittals';
import type { ChangeEvent } from '@/types/change_events';
import type { PrimeContract } from '@/types/prime_contracts';
import type { FundingSource } from '@/types/funding_source';

export interface SeedData {
  account: Account | null;
  users: User[];
  projects: Project[];
  wbs: WBSItem[];
  hubs: Hub[];
  budget: BudgetLineItem[];
  schedule: ScheduleEntry[];
  tasks: Task[];
  documents: Document[];
  assets: Asset[];
  actionPlans: ActionPlan[];
  rfis: Rfi[];
  specifications: SpecificationDivision[];
  riskTags: RiskTag[];
  manualRiskItems: ManualRiskItem[];
  connectedProjects: ConnectedProjectHealth[];
  healthSnapshotsByProject: Record<string, HealthSnapshot[]>;
  // Extended seed data for UC#2, UC#4, UC#6
  observations: Observation[];
  submittals: Submittal[];
  changeEvents: ChangeEvent[];
  primeContracts: PrimeContract[];
  fundingSources: FundingSource[];
  budgetLineItems: BudgetLineItem[];
  scheduleEntries: ScheduleEntry[];
  incidents: Incident[];
  workHours: WorkHours[];
  automationRules: any[];
}

const defaultSeedData: SeedData = {
  account: null,
  users: [],
  projects: [],
  wbs: [],
  hubs: [],
  budget: [],
  schedule: [],
  tasks: [],
  documents: [],
  assets: [],
  actionPlans: [],
  rfis: [],
  specifications: [],
  riskTags: [],
  manualRiskItems: [],
  connectedProjects: [],
  healthSnapshotsByProject: {},
  observations: [],
  submittals: [],
  changeEvents: [],
  primeContracts: [],
  fundingSources: [],
  budgetLineItems: [],
  scheduleEntries: [],
  incidents: [],
  workHours: [],
  automationRules: [],
};

interface DataContextValue {
  data: SeedData;
  setData: (data: SeedData) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children, initialData }: {
  children: React.ReactNode;
  initialData?: Partial<SeedData>;
}) {
  const [data, setData] = useState<SeedData>({ ...defaultSeedData, ...initialData });

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
