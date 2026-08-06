import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'sample_anon_key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'sample_service_key',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_ai_workflow_automation_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
