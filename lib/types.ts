export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  company_id: string;
  role: 'admin' | 'user';
  hourly_rate: number;
  created_at: string;
  company?: Company;
}

export interface WorkEntry {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  hours: number;
  description: string;
  hourly_rate: number;
  cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  companies?: Company;
}

export interface ExpenseEntry {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  amount: number;
  category: 'fattura' | 'acquisto' | 'rimborso' | 'altro';
  description: string;
  attachment_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  companies?: Company;
}

export interface RevenueEntry {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  amount: number;
  description: string;
  source: 'stripe' | 'bonifico' | 'contanti' | 'altro';
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  stripe_customer_id: string | null;
  client_name: string | null;
  invoice_number: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  companies?: Company;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted';
  table_name: string;
  record_id: string;
  created_at: string;
}
