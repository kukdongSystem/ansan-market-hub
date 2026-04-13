
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function probeAddress() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const cols = ['address', 'road_address', 'full_address'];

    for (const col of cols) {
        const obj = {};
        obj[col] = 'test address';
        console.log(`Probing Address col [${col}]...`);
        const { error } = await supabase.from('stores').insert([obj]);
        if (error && error.message.includes('schema cache')) {
            // not found
        } else {
            console.log(` -> FOUND! ${col} is the one. (Result: ${error?.message})`);
            return;
        }
    }
}

probeAddress();
