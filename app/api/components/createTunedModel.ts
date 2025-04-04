/* eslint-disable @typescript-eslint/no-explicit-any */
//import fetch from 'node-fetch';
//import TrainingData from '@/data/trainingData';
//import ClassificationData from '@/data/classificationData';

interface CreateTunedModelRequest {
    display_name: string;
    base_model: string;
    tuning_task: {
        hyperparameters: {
            batch_size: number;
            learning_rate: number;
            epoch_count: number;
        };
        training_data: {
            examples: {
                examples: any[];
            };
        };
    };
}


async function createTunedModel(modelInfo: {modelName: string, type: string, trainingData: []}): Promise<string> {
   
    const requestBody: CreateTunedModelRequest = {
        display_name: modelInfo.modelName,
        base_model: "models/gemini-1.5-flash-001-tuning",
        tuning_task: {
            hyperparameters: {
                batch_size: 4,
                learning_rate: 0.001,
                epoch_count: 5,
            },
            training_data: {
                examples: {
                    examples: modelInfo.trainingData,
                },
            },
        },
    };

    console.log('this is the TRAINING DATA', modelInfo.trainingData)

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (response.ok) {
        console.log('Tuning job created successfully:', data);
        return data.name; // The tuning operation ID
    } else {
        throw new Error(`Error creating tuning job: ${data.error.message}`);
    }
}

export default createTunedModel;
