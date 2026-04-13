
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function finalProbe() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const columns = ['name', 'location', 'phone', 'category', 'vendor_id', 'vendor_email', 'is_verified', 'description'];

    for (const col of columns) {
        const obj = {};
        obj[col] = 'test';
        console.log(`Probing [${col}]...`);
        const { error } = await supabase.from('stores').insert([obj]);
        if (error && error.message.includes('schema cache')) {
            console.log(` -> ${col} is NOT in DB.`);
        } else {
            console.log(` -> ${col} EXISTS in DB! (Result: ${error?.message || 'SUCCESS'})`);
        }
    }
}

finalProbe();
