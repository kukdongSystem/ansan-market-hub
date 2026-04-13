
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function checkSchema() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Checking stores table...");
    const { data, error } = await supabase.from('stores').select('*').limit(1);
    
    if (error) {
        console.error("Error fetching stores:", error.message);
    } else if (data && data.length > 0) {
        console.log("Found store. Columns:", Object.keys(data[0]));
        console.log("Sample data:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No data in stores table. Inserting trial...");
        const { error: insError } = await supabase.from('stores').insert([{ dummy: 'row' }]);
        console.log("Insert trial error message (should contain valid columns):", insError?.message);
    }
}

checkSchema();
