
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function findOwnerCol() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const cols = ['user_id', 'owner_id', 'author_id', 'created_by', 'uid', 'email'];

    for (const col of cols) {
        const obj = {};
        obj[col] = '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a'; // Try a UUID
        console.log(`Probing ID col [${col}]...`);
        const { error } = await supabase.from('stores').insert([obj]);
        if (error && error.message.includes('schema cache')) {
            // not found
        } else {
            console.log(` -> FOUND! ${col} is the one. (Result: ${error?.message})`);
            return;
        }
    }
}

findOwnerCol();
