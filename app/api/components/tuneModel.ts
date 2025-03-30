import createTunedModel from './createTunedModel';
import monitorTuningJob from './monitorTuningJob';

const model = async (modelInfo: {modelName: string, type: string}): Promise<string | boolean> => {
    try {
        const operationId = await createTunedModel(modelInfo);
        const result = await monitorTuningJob(operationId);
        if (result !== undefined) {
            return result;
        } else {
            throw new Error("Tuning job did not return a valid result");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
};

export default model;