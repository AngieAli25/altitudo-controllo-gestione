-- ============================================
-- Altitudo Tracker — Supabase Migration
-- ============================================

-- Tabella companies
CREATE TABLE companies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Tabella profiles
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text NOT NULL,
  company_id   uuid REFERENCES companies(id),
  role         text NOT NULL CHECK (role IN ('admin', 'user')),
  hourly_rate  numeric(10,2) DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- Tabella work_entries (ore lavorate)
CREATE TABLE work_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id),
  company_id   uuid REFERENCES companies(id),
  date         date NOT NULL,
  hours        numeric(5,2) NOT NULL,
  description  text NOT NULL,
  hourly_rate  numeric(10,2) NOT NULL,
  cost         numeric(10,2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
  notes        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Tabella expense_entries (spese vive)
CREATE TABLE expense_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  company_id      uuid REFERENCES companies(id),
  date            date NOT NULL,
  amount          numeric(10,2) NOT NULL,
  category        text NOT NULL CHECK (category IN ('fattura', 'acquisto', 'rimborso', 'altro')),
  description     text NOT NULL,
  attachment_name text,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Tabella activity_log (audit trail)
CREATE TABLE activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id),
  action      text NOT NULL,
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Companies: tutti possono leggere
CREATE POLICY "companies_select" ON companies FOR SELECT USING (true);

-- Profiles: tutti possono leggere, solo admin può modificare
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Work entries
CREATE POLICY "work_entries_select" ON work_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "work_entries_insert" ON work_entries FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "work_entries_update" ON work_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);
CREATE POLICY "work_entries_delete" ON work_entries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);

-- Expense entries
CREATE POLICY "expense_entries_select" ON expense_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "expense_entries_insert" ON expense_entries FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "expense_entries_update" ON expense_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);
CREATE POLICY "expense_entries_delete" ON expense_entries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR user_id = auth.uid()
);

-- Activity log: solo admin può leggere, insert per tutti (via trigger)
CREATE POLICY "activity_log_select" ON activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "activity_log_insert" ON activity_log FOR INSERT WITH CHECK (true);

-- ============================================
-- Trigger per updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_entries_updated_at
  BEFORE UPDATE ON work_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expense_entries_updated_at
  BEFORE UPDATE ON expense_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Trigger per activity_log automatico
-- ============================================

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id)
    VALUES (NEW.user_id, 'created', TG_TABLE_NAME, NEW.id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id)
    VALUES (NEW.user_id, 'updated', TG_TABLE_NAME, NEW.id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (user_id, action, table_name, record_id)
    VALUES (OLD.user_id, 'deleted', TG_TABLE_NAME, OLD.id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER work_entries_audit
  AFTER INSERT OR UPDATE OR DELETE ON work_entries
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER expense_entries_audit
  AFTER INSERT OR UPDATE OR DELETE ON expense_entries
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================
-- Dati iniziali
-- ============================================

INSERT INTO companies (name) VALUES ('Guidaevai'), ('Reddoak');
