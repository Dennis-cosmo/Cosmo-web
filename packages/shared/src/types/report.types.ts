export interface Report {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: ReportStatus;
  pdfUrl?: string;
  reportType?: ReportType;
  metadata?: Record<string, any>;
  sustainabilityScore?: number;
  totalGreenExpenses?: number;
  totalNonGreenExpenses?: number;
  carbonFootprint?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportStatus = 'draft' | 'generated' | 'published';
export type ReportType = 'sustainability' | 'expense' | 'summary';

export interface ReportCreateDTO {
  name: string;
  startDate: Date;
  endDate: Date;
  reportType: ReportType;
  metadata?: Record<string, any>;
}

export interface ReportUpdateDTO {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ReportStatus;
  reportType?: ReportType;
  metadata?: Record<string, any>;
}

export interface ReportSummary {
  totalExpenses: number;
  greenExpensePercentage: number;
  nonGreenExpensePercentage: number;
  sustainabilityScore: number;
  carbonFootprint: number;
  topGreenCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
} 