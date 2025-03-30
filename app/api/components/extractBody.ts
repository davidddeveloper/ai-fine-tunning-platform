//import { gmail_v1 } from 'googleapis/build/src/apis/gmail/v1';

interface MessagePayload {
    parts: MessagePart[];
    mimeType: string;
    body: {
        data: string;
    };
}

interface MessagePart {
    mimeType: string;
    body: {
        data: string;
    };
}

function extractBody(payload: MessagePayload): string {
  if (!payload) return "No content available";  // Fallback for missing payload

  const parts = payload.parts || [];

  // Check if the email is a simple plain text email without `parts`
  if (payload.mimeType === "text/plain" && payload.body?.data) {
      return getPartBody(payload);
  }

  const textPart = parts.find((part) => part.mimeType === "text/plain");
  const htmlPart = parts.find((part) => part.mimeType === "text/html");

  console.log('this is the textPart', textPart);
  console.log('this is the htmlPart', htmlPart);

  if (textPart) {
      return getPartBody(textPart);
  } else if (htmlPart) {
      return getPartBody(htmlPart);
  } else {
      return "No readable text found";  // Instead of throwing an error
  }
}
  
  function getPartBody(part: MessagePart | undefined): string {
    
    if (part && part.body && part.body.data) {
      return Buffer.from(part.body.data, "base64").toString("utf-8");
    } else {
      throw new Error("Email part does not have a data property");
    }
  }

export default extractBody;