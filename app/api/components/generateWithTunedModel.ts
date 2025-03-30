export async function generateWithTunedModel(modelName: string, inputText: string): Promise<string> {
    const requestBody = {
        contents: [{
            parts: [{ text: inputText }]
        }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    console.log('this is the response from generateWithtunemodel', response)

    const data = await response.json();
    if (response.ok) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error(`Error generating content: ${data.error.message}`);
    }
}

export default generateWithTunedModel;
