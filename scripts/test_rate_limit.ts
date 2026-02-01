import { createClient } from '@supabase/supabase-js';

// Simple script to test rate limiting
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runTest() {
    console.log(`🚀 Testing Rate Limit on ${BASE_URL}/api/admin/stats...`);

    let successCount = 0;
    let failCount = 0;

    const totalRequests = 30; // Our limit is 20 per 10s, so 30 should trigger it.

    const promises = [];

    for (let i = 0; i < totalRequests; i++) {
        promises.push(
            fetch(`${BASE_URL}/api/admin/stats`, {
                method: 'GET',
                // Mock headers if needed, but simple fetch works for IP limit
            }).then(res => {
                const status = res.status;
                if (status === 200 || status === 401 || status === 403) {
                    // 401/403 is "Success" reaching the app logic (auth check), not blocked by Middleware
                    process.stdout.write('.');
                    successCount++;
                } else if (status === 429) {
                    process.stdout.write('x');
                    failCount++;
                } else {
                    process.stdout.write('?');
                    console.log(status);
                }
            })
        );
        // await sleep(50); // Small delay to simulate burst
    }

    await Promise.all(promises);

    console.log('\n\n--- Results ---');
    console.log(`✅ Allowed: ${successCount}`);
    console.log(`⛔ Blocked (429): ${failCount}`);

    if (failCount > 0) {
        console.log('🎉 Rate Limiting is WORKING!');
    } else {
        console.log('⚠️ Rate Limiting NOT successfully triggered.');
        console.log('Possible reasons:');
        console.log('1. UPSTASH env vars are missing.');
        console.log('2. Limit is too high (set to 20/10s).');
        console.log('3. Running on localhost where IP might be ::1 and varying.');
    }
}

runTest();
