export interface DashboardData {
  salesTotal: number;
  quoteCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  salesByMonth: Array<{ label: string; value: number }>;
}
