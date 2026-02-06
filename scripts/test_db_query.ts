
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass policies if needed, or anon
);

async function testQuery() {
    console.log('Testing UUID prefix search...');
    const userIdPrefix = '7c2adfb3'; // From the error log

    // Attempt 1: filter with cast
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .filter('id::text', 'like', `${userIdPrefix}%`)
        .limit(1);

    if (error) {
        console.error('❌ Attempt 1 failed:', error);
    } else {
        console.log('✅ Attempt 1 success:', data);
    }
}

testQuery();
