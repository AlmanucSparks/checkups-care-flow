import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const BACKEND_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://uxuihuaqxorwywjiztdh.supabase.co';
const BACKEND_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1eHVpaHVhcXhvcnd5d2ppenRkaCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0NTc1OTczLCJleHAiOjIwODAxNTE5NzN9.40V0VUCnWGel6HfkoZc_xAwbmzFzqd9Sikgfc10pb_A';

export const supabase = createClient<Database>(BACKEND_URL, BACKEND_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});