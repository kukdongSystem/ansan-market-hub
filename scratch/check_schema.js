const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Fetching exact columns for "stores" table...');
  // select one row to see keys
  const { data, error } = await supabase.from('stores').select('*').limit(1);
  
  if (error) {
    if (error.code === 'PGRST116') {
        // Table exists but empty, try to get column names via RPC if possible or another way
        console.log('Table is empty. Trying to list columns via another method...');
    } else {
        console.error('Error fetching schema:', error);
        return;
    }
  }

  // If table is empty, we can get columns from the error message of an invalid insert
  const { error: insertError } = await supabase.from('stores').insert({ invalid_column_test: 'test' });
  console.log('Columns likely available:', insertError?.message);
}

checkSchema();
