-- Add missing columns to cms_schemes table
ALTER TABLE public.cms_schemes 
ADD COLUMN IF NOT EXISTS scheme_name_mr text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS description_mr text,
ADD COLUMN IF NOT EXISTS eligibility_criteria text,
ADD COLUMN IF NOT EXISTS eligibility_criteria_mr text,
ADD COLUMN IF NOT EXISTS benefits text,
ADD COLUMN IF NOT EXISTS benefits_mr text,
ADD COLUMN IF NOT EXISTS how_to_apply text,
ADD COLUMN IF NOT EXISTS how_to_apply_mr text,
ADD COLUMN IF NOT EXISTS helpline text,
ADD COLUMN IF NOT EXISTS order_index int DEFAULT 0;
