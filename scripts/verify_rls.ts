import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
    console.log('🔒 Verifying RLS Policies...');
    console.log('Attempting to fetch profiles with ANONYMOUS key (should fail or return empty)...');

    try {
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (error) {
            console.log('✅ Success: Query returned an error (expected if RLS blocks completely):', error.message);
        } else if (count === 0 || (data && data.length === 0)) {
            console.log('✅ Success: Query returned 0 profiles. Anonymous users cannot see data.');
        } else {
            console.error('❌ FAILURE: Anonymous query returned data!');
            console.error(`Found ${data?.length} profiles.`);
            if (data && data.length > 0) {
                console.error('First profile ID exposed:', data[0].id);
                console.error('First profile Email exposed:', data[0].email);
            }
            console.log('Hint: Did you run the correct SQL script? Ensure "ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;" was executed.');
        }
    } catch (err) {
        console.log('✅ Success: Request failed as expected.', err);
    }
}

checkRLS();
