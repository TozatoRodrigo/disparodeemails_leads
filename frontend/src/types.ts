export interface Lead {
  nome: string;
  email: string;
  empresa?: string | null;
}

export interface Batch {
  batchId: string;
  totalLeads: number;
  leadsInvalidos: number;
  message: string;
}

export interface BatchStatus {
  id: string;
  filename: string;
  totalLeads: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  sucessos: number;
  erros: Array<{ email: string; error: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryBatch {
  id: string;
  filename: string;
  totalLeads: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  sucessos: number;
  erros: number;
  createdAt: string;
  updatedAt: string;
}

