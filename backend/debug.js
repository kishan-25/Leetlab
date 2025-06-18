import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const debugJudge0 = async () => {
    console.log('=== JUDGE0 DEBUG SESSION ===');
    console.log('Environment Variables:');
    console.log('JUDGE0_API_URL:', process.env.JUDGE0_API_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log();

    try {
        // Test 1: Check /about endpoint
        console.log('1. Testing /about endpoint...');
        const aboutUrl = `${process.env.JUDGE0_API_URL}/about`;
        console.log('URL:', aboutUrl);
        
        const aboutResponse = await axios.get(aboutUrl);
        console.log('✅ About endpoint works');
        console.log('Response:', aboutResponse.data);
        console.log();

        // Test 2: Test the exact submission that's failing in your code
        console.log('2. Testing batch submission...');
        const testSubmissions = [
            {
                source_code: `// Read input from stdin
process.stdin.setEncoding('utf8');
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const [a, b] = input.trim().split(' ').map(Number);
    console.log(a + b);
});`,
                language_id: 63, // JavaScript
                stdin: "100 200",
                expected_output: "300",
                cpu_time_limit: 2,
                memory_limit: 128000
            }
        ];

        console.log('Submission payload:', JSON.stringify({ submissions: testSubmissions }, null, 2));
        
        const batchUrl = `${process.env.JUDGE0_API_URL}/submissions/batch`;
        console.log('Batch URL:', batchUrl);
        
        const batchResponse = await axios.post(
            batchUrl,
            { submissions: testSubmissions },
            {
                params: {
                    base64_encoded: false
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log('✅ Batch submission successful');
        console.log('Response:', batchResponse.data);
        console.log();

        // Test 3: Poll for results
        if (batchResponse.data && batchResponse.data.length > 0) {
            const token = batchResponse.data[0].token;
            console.log('3. Polling for results...');
            console.log('Token:', token);
            
            let attempts = 0;
            while (attempts < 10) {
                const pollUrl = `${process.env.JUDGE0_API_URL}/submissions/batch`;
                const pollResponse = await axios.get(pollUrl, {
                    params: {
                        tokens: token,
                        base64_encoded: false,
                        fields: "token,stdout,stderr,status_id,language_id,memory,time,compile_output,message,status"
                    }
                });

                console.log(`Poll attempt ${attempts + 1}:`, pollResponse.data);
                
                if (pollResponse.data.submissions && 
                    pollResponse.data.submissions[0].status.id > 2) {
                    console.log('✅ Execution completed');
                    console.log('Final result:', pollResponse.data.submissions[0]);
                    break;
                }
                
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
        
        if (error.request) {
            console.error('Request details:');
            console.error('URL:', error.config?.url);
            console.error('Method:', error.config?.method);
            console.error('Data:', error.config?.data);
        }
    }
};

debugJudge0();