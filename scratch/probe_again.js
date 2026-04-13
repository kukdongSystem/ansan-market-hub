
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

async function probeAgain() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Attempt: name + user_id
    console.log("Probing with 'name' and 'user_id'...");
    const { error } = await supabase.from('stores').insert([{ name: 'Probe', user_id: '5f6e9ec5-18cf-4f62-9e6d-f3cce0d4a02a' }]);
    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("SUCCESS! name and user_id are correct.");
    }
}

probeAgain();
