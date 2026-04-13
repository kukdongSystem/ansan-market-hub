
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function massProbe() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const variants = [
        { store_name: 'test' },
        { storeName: 'test' },
        { sName: 'test' },
        { name: 'test' },
        { title: 'test' }
    ];

    for (const v of variants) {
        console.log(`Probing with: ${JSON.stringify(v)}`);
        const { error } = await supabase.from('stores').insert([v]);
        if (error) {
            console.log(` -> Result: ${error.message}`);
        } else {
            console.log(` -> SUCCESS with ${Object.keys(v)[0]}!`);
            return;
        }
    }
}

massProbe();
