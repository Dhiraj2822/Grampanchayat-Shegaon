-- ==========================================
-- PAYMENT SYSTEM MIGRATION
-- ==========================================

BEGIN;

-- 1. Create Service Charges Table
CREATE TABLE IF NOT EXISTS public.cms_service_charges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text NOT NULL,
  service_code text NOT NULL UNIQUE, -- e.g., 'birth_cert', 'property_tax'
  amount numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for service charges
ALTER TABLE public.cms_service_charges ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read service charges" ON public.cms_service_charges
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin write service charges" ON public.cms_service_charges
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  service_type text NOT NULL, -- 'certificate', 'tax'
  reference_id text NOT NULL, -- Application Number or Property ID
  amount numeric NOT NULL,
  status text CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  transaction_id text, -- Gateway Transaction ID
  payment_method text, -- 'upi', 'card', 'netbanking'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payments
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own payments
CREATE POLICY "Users insert own payments" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins view all payments" ON public.payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- 3. Update Certificate Tables
-- Add payment_status, fee_amount, admin_comments to all certificate tables
DO $$
DECLARE 
  t text;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' 
    AND tablename LIKE 'cit_%_certificate' 
    OR tablename = 'cit_property_tax_extract'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS payment_status text DEFAULT ''na''', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS fee_amount numeric DEFAULT 0', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS admin_comments text', t);
  END LOOP;
END$$;

-- 4. Seed Initial Service Charges
INSERT INTO public.cms_service_charges (service_name, service_code, amount) VALUES
  ('Birth Certificate', 'birth_cert', 50),
  ('Death Certificate', 'death_cert', 20),
  ('Marriage Certificate', 'marriage_cert', 100),
  ('Property Tax Extract', 'property_tax_extract', 50),
  ('No Dues Certificate', 'no_dues', 20),
  ('BPL Certificate', 'bpl_cert', 10),
  ('Destitute Certificate', 'destitute_cert', 0)
ON CONFLICT (service_code) DO UPDATE SET amount = EXCLUDED.amount;

COMMIT;
