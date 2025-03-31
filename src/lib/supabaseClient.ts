import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxwlhcbtygmhtfsitqjd.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4d2xoY2J0eWdtaHRmc2l0cWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MzgwNjIsImV4cCI6MjA0NzAxNDA2Mn0.MbaLJDIyytAA6IR83ufsIhyhsxcUuQ5ZXEl-DGd712c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
