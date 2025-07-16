/*
  # BMT Market Survey Database Schema

  1. New Tables
    - `bmt_surveys`
      - `id` (uuid, primary key)
      - Salesperson information fields
      - Physician and facility information fields  
      - BMT patient volume data fields
      - Disease category patient counts
      - Additional information fields
      - `submission_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bmt_surveys` table
    - Add policy for public insert (for form submissions)
    - Add policy for public read (for dashboard)
*/

CREATE TABLE IF NOT EXISTS bmt_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sales Representative Information
  salesperson_name text NOT NULL,
  salesperson_contact text,
  salesperson_email text,
  territory text,
  
  -- Physician & Facility Information
  physician_name text NOT NULL,
  physician_specialization text,
  facility_name text NOT NULL,
  facility_type text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  facility_contact text,
  facility_email text,
  
  -- BMT Patient Volume Data
  monthly_bmt_patients integer NOT NULL DEFAULT 0,
  annual_bmt_patients integer NOT NULL DEFAULT 0,
  autologous_percentage integer DEFAULT 0,
  allogeneic_percentage integer DEFAULT 0,
  average_patient_age integer DEFAULT 0,
  pediatric_percentage integer DEFAULT 0,
  
  -- Disease Categories (Monthly Patient Count)
  all_patients integer DEFAULT 0,
  aml_patients integer DEFAULT 0,
  cll_patients integer DEFAULT 0,
  cml_patients integer DEFAULT 0,
  multiple_myeloma_patients integer DEFAULT 0,
  lymphoma_patients integer DEFAULT 0,
  aplastic_anemia_patients integer DEFAULT 0,
  other_blood_disorders integer DEFAULT 0,
  solid_tumor_patients integer DEFAULT 0,
  
  -- Additional Information
  treatment_protocols text,
  challenges text,
  new_therapy_interest text,
  additional_notes text,
  
  -- Metadata
  submission_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bmt_surveys ENABLE ROW LEVEL SECURITY;

-- Allow public insert for form submissions
CREATE POLICY "Allow public survey submissions"
  ON bmt_surveys
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public read for dashboard
CREATE POLICY "Allow public survey reads"
  ON bmt_surveys
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bmt_surveys_submission_date ON bmt_surveys(submission_date);
CREATE INDEX IF NOT EXISTS idx_bmt_surveys_facility_name ON bmt_surveys(facility_name);
CREATE INDEX IF NOT EXISTS idx_bmt_surveys_city_state ON bmt_surveys(city, state);
CREATE INDEX IF NOT EXISTS idx_bmt_surveys_salesperson ON bmt_surveys(salesperson_name);