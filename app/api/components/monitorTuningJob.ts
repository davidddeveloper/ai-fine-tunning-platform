//import fetch from 'node-fetch';

interface TuningJobResponse {
    metadata?: {
        completedPercent?: number;
        tunedModel?: string;
    };
    done?: boolean;
    error?: {
        message: string;
    };
}

async function monitorTuningJob(operationId: string): Promise<string | undefined> {
    let tuningDone = false;
    while (!tuningDone) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/${operationId}?key=${process.env.GEMINI_API_KEY}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json() as TuningJobResponse;
        if (data.metadata?.completedPercent !== undefined) {
            console.log(`Tuning Progress: ${data.metadata.completedPercent}%`);
        }
        
        if (data.done) {
            tuningDone = true;
            if (data.metadata?.tunedModel) {
                console.log("Tuning job complete!", data.metadata.tunedModel);
                return data.metadata.tunedModel; // The tuned model ID
            } else if (data.error) {
                throw new Error(`Error in tuning job: ${data.error.message}`);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before polling again
    }
}

export default monitorTuningJob;