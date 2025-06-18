import axios from "axios"

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,      // Python 3.8.1
        "JAVA": 62,        // Java 13.0.1
        "JAVASCRIPT": 63   // JavaScript (Node.js 12.14.0)
    }
    return languageMap[language.toUpperCase()]
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResults = async (tokens) => {
    let attempts = 0
    const maxAttempts = 30 // Maximum 30 seconds of polling
    
    while(attempts < maxAttempts){
        try {
            console.log(`JUDGE0_API_URL = ${process.env.JUDGE0_API_URL} (Attempt ${attempts + 1})`);
            
            const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                    fields: "token,stdout,stderr,status_id,language_id,memory,time,compile_output,message,status"
                }
            })

            console.log("data in polling:", data);
            const results = data.submissions;
            console.log("results in polling:", results);

            // Check if all submissions are done processing
            const isAllDone = results.every(
                (r) => r.status.id !== 1 && r.status.id !== 2 // 1: In Queue, 2: Processing
            )
            
            console.log("is all done:", isAllDone);
            
            if(isAllDone) {
                // Log detailed results for debugging
                results.forEach((result, index) => {
                    console.log(`Result ${index + 1}:`, {
                        token: result.token,
                        status: result.status,
                        stdout: result.stdout,
                        stderr: result.stderr,
                        message: result.message,
                        compile_output: result.compile_output
                    });
                });
                return results;
            }
            
            attempts++;
            await sleep(1000);
            console.log("sleep done");
        } catch (error) {
            console.error("Error during polling:", error.message);
            attempts++;
            await sleep(1000);
        }
    }
    
    throw new Error("Polling timeout: submissions took too long to complete");
}

export const submitBatch = async (submissions) => {
    try {
        console.log("Judge0 URL:", process.env.JUDGE0_API_URL);
        console.log("Submitting batch with submissions:", submissions);
        
        const { data } = await axios.post(
            `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
            { submissions },
            // {
            //     // headers: {
            //     //     'Content-Type': 'application/json',
            //     //     'Accept': 'application/json' 
            //     // }
            // }
        );
        
        console.log("Submission Results:", data);
        return data;
    } catch (error) {
        console.error("Error submitting batch:", error.response?.data || error.message);
        throw error;
    }
};
