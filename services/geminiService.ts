import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { DroneTelemetry, DeliveryOrder } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the tools available to the AI
const tools: FunctionDeclaration[] = [
  {
    name: "abort_delivery",
    description: "Abort the current delivery and return to base immediately.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "request_status",
    description: "Get detailed status of the cargo.",
    parameters: { type: Type.OBJECT, properties: {} }
  }
];

export interface AIResponse {
  text: string;
  functionCalls?: { name: string; args: any }[];
}

export const getMissionAdvice = async (
  query: string,
  telemetry: DroneTelemetry,
  activeOrder: DeliveryOrder | null,
  lastLogs: string[]
): Promise<AIResponse> => {
  if (!apiKey) {
    return { text: "Logistics AI Offline: API Key missing." };
  }

  try {
    const deliveryInfo = activeOrder 
      ? `Active Order: ${activeOrder.item} for ${activeOrder.recipient}. Dest: ${activeOrder.locationName}.`
      : "No active delivery. Standing by at Warehouse.";

    const prompt = `
      You are SkyCaptain Logistics AI, a specialized assistant for drone delivery operations.
      Your goal is to ensure safe and timely delivery of tools and parts to on-site workers.
      
      Current Telemetry:
      - Status: ${telemetry.status}
      - Battery: ${telemetry.battery.toFixed(2)}%
      
      ${deliveryInfo}

      Recent Logs:
      ${lastLogs.slice(-3).join('\n')}

      User Query: "${query}"

      Provide a helpful, logistical response. Use the tone of a professional dispatcher. Keep it under 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: tools }],
      }
    });

    // Extract text
    const text = response.text || "";

    // Extract function calls
    const candidates = response.candidates;
    const functionCalls = candidates?.[0]?.content?.parts
      ?.filter(p => p.functionCall)
      .map(p => ({
        name: p.functionCall!.name,
        args: p.functionCall!.args
      }));

    return { text, functionCalls };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Logistics Control Error: Unable to reach AI subsystem." };
  }
};