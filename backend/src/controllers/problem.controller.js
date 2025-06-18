import {db} from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async(req, res) => {
    const { title, 
            description, 
            difficulty, 
            tags, 
            examples, 
            constraints, 
            testcases, 
            codeSnippets, 
            referenceSolutions
        } = req.body;

    console.log("req user:", req.user);
    
    if(req.user.role !== 'ADMIN') {
        return res.status(403).json({
            message: "You are not allowed to create a problem"
        });
    }

    console.log("reference solution:", referenceSolutions);
    
    try {
        // Validate all reference solutions before processing
        const validationResults = [];
        
        for(const [language, solutionCode] of Object.entries(referenceSolutions)) {
            console.log(`\n=== Validating ${language} solution ===`);
            
            const languageId = getJudge0LanguageId(language);
            
            if(!languageId) {
                return res.status(400).json({
                    error: `Language ${language} is not supported. Available languages: PYTHON, JAVA, JAVASCRIPT`
                });
            }

            console.log(`Language ID for ${language}: ${languageId}`);

            // Prepare submissions for this language
            const submissions = testcases.map((testcase, index) => {
                console.log(`Preparing testcase ${index + 1}:`, {
                    input: testcase.input,
                    expected_output: testcase.output
                });
                
                return {
                    source_code: solutionCode,
                    language_id: languageId,
                    stdin: testcase.input,
                    expected_output: testcase.output,
                    cpu_time_limit: 2,
                    memory_limit: 128000
                };
            });

            console.log(`Submitting ${submissions.length} test cases for ${language}`);

            // Submit batch for this language
            const submissionResults = await submitBatch(submissions);
            console.log(`Submissions completed for ${language}`);
            
            const tokens = submissionResults.map((res) => res.token);
            console.log(`Tokens received for ${language}:`, tokens);
            
            // Poll for results
            const results = await pollBatchResults(tokens);
            console.log(`Polling completed for ${language}`);

            // Validate results
            let allTestsPassed = true;
            const failedTests = [];
            
            for(let i = 0; i < results.length; i++) {
                const result = results[i];
                const testcase = testcases[i];
                
                console.log(`\nTestcase ${i + 1} for ${language}:`);
                console.log(`  Input: ${testcase.input}`);
                console.log(`  Expected: ${testcase.output}`);
                console.log(`  Got: ${result.stdout?.trim() || 'null'}`);
                console.log(`  Status: ${result.status.description} (ID: ${result.status.id})`);
                
                if(result.stderr) {
                    console.log(`  Error: ${result.stderr}`);
                }
                if(result.message) {
                    console.log(`  Message: ${result.message}`);
                }
                if(result.compile_output) {
                    console.log(`  Compile Output: ${result.compile_output}`);
                }

                // Status ID 3 = Accepted
                if(result.status.id !== 3) {
                    allTestsPassed = false;
                    failedTests.push({
                        testcase: i + 1,
                        input: testcase.input,
                        expected: testcase.output,
                        actual: result.stdout?.trim() || null,
                        status: result.status.description,
                        error: result.stderr,
                        message: result.message
                    });
                }
            }

            if(!allTestsPassed) {
                return res.status(400).json({
                    error: `Reference solution validation failed for ${language}`,
                    language: language,
                    failedTests: failedTests,
                    details: "The reference solution doesn't produce correct output for all test cases"
                });
            }

            validationResults.push({
                language: language,
                status: 'passed',
                testsPassed: results.length
            });

            console.log(` All tests passed for ${language}`);
        }

        // If we reach here, all reference solutions are valid
        console.log("All reference solutions validated successfully");
        console.log("Validation results:", validationResults);

        // Save the problem to the database
        const newProblem = await db.problem.create({
            data: {
                title, 
                description, 
                difficulty, 
                tags, 
                examples, 
                constraints, 
                testcases, 
                codeSnippets, 
                referenceSolutions, 
                userId: req.user.id
            }
        });

        return res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem: newProblem,
            validationResults: validationResults
        });

    } catch(error) {
        console.error("Error while creating problem:", error);
        
        // More detailed error handling
        if(error.response?.data) {
            console.error("Judge0 API Error:", error.response.data);
        }
        
        return res.status(500).json({
            error: "Error while creating problem",
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

export const getAllProblem = async(req, res) => {}
export const getProblemById = async(req, res) => {}
export const updateProblem = async(req, res) => {}
export const deleteProblem = async(req, res) => {}
export const getAllProblemsSolvedByUser = async(req, res) => {}