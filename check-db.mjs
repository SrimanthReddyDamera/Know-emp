
import { createClient } from '@supabase/supabase-js';

import fs from 'fs';

import path from 'path';

// Manual parsing of .env.local to avoid dotenv issues if not installed or configured for .env.local
const envConfig = fs.readFileSync('.env.local', 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Attempting to connect to:", supabaseUrl);
    
    // Try to select from employees to see if it's accessible
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error fetching employees:", error);
    } else {
        console.log("Successfully fetched employees. Count:", data.length);
        console.log("Employees found:", data);
    }
}

check();
