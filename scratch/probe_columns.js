
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function probeColumns() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Attempt 1: store_name
    console.log("Probing with 'store_name'...");
    const res1 = await supabase.from('stores').insert([{ store_name: 'Probe', vendor_id: 'dummy' }]);
    if (res1.error) {
        console.log("store_name failure:", res1.error.message);
    } else {
        console.log("store_name SUCCESS!");
    }

    // Attempt 2: name
    console.log("Probing with 'name'...");
    const res2 = await supabase.from('stores').insert([{ name: 'Probe', vendor_id: 'dummy' }]);
    if (res2.error) {
        console.log("name failure:", res2.error.message);
    } else {
        console.log("name SUCCESS!");
    }
}

probeColumns();
