-- Tabella revenue_entries (incassi)
CREATE TABLE revenue_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  company_id      uuid REFERENCES companies(id),
  date            date NOT NULL,
  amount          numeric(10,2) NOT NULL,
  description     text NOT NULL,
  source          text NOT NULL CHECK (source IN ('stripe', 'bonifico', 'contanti', 'altro')),
  stripe_payment_id text,          -- Stripe payment intent ID for linking
  stripe_invoice_id text,          -- Stripe invoice ID
  stripe_customer_id text,         -- Stripe customer ID
  client_name     text,            -- Nome cliente
  invoice_number  text,            -- Numero fattura
  status          text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_entries_select" ON revenue_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "revenue_entries_insert" ON revenue_entries FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "revenue_entries_update" ON revenue_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);
CREATE POLICY "revenue_entries_delete" ON revenue_entries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);

-- Triggers
CREATE TRIGGER revenue_entries_updated_at
  BEFORE UPDATE ON revenue_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER revenue_entries_audit
  AFTER INSERT OR UPDATE OR DELETE ON revenue_entries
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Index for Stripe lookups
CREATE INDEX idx_revenue_stripe_payment ON revenue_entries(stripe_payment_id) WHERE stripe_payment_id IS NOT NULL;
CREATE INDEX idx_revenue_stripe_invoice ON revenue_entries(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
