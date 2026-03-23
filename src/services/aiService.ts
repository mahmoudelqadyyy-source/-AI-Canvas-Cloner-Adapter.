import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCodeFromImage(imageBase64: string, similarity: number): Promise<string> {
  const base64Data = imageBase64.split(',')[1];
  const mimeType = imageBase64.split(';')[0].split(':')[1];

  let prompt = '';
  
  const basePrompt = `
    Return ONLY valid, complete React TSX code using Tailwind CSS classes. 
    Do NOT include any \`import\` statements. 
    Do NOT include any \`export default\` statements. 
    Just return a single functional component named \`GeneratedComponent\`.
    Assume React and lucide-react icons are available in the global scope.
    Do not include markdown formatting or explanations.
  `;

  if (similarity <= 30) {
    prompt = `Analyze the provided UI screenshot. Extract the information architecture, data structure, and functional blocks from this image. Redesign them using modern SaaS UI trends. Do not copy the exact colors or spacing. Create a completely new, clean, professional layout using Tailwind CSS. Use a fresh Slate & Indigo color palette. ${basePrompt}`;
  } else if (similarity <= 70) {
    prompt = `Analyze the provided UI screenshot. Keep the general layout and structure, but modify the colors, typography, and spacing to feel more modern and balanced. Use a clean SaaS aesthetic. ${basePrompt}`;
  } else {
    prompt = `Analyze the provided UI screenshot. Strictly adhere to the CSS values, spacing, layout, and color hex codes found in this image. Attempt to clone the design exactly as it appears. ${basePrompt}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      temperature: 0.2,
    }
  });

  let code = response.text || '';
  
  // Clean up markdown code blocks if present
  code = code.replace(/^```(tsx|jsx|typescript|javascript|react)?\n/i, '');
  code = code.replace(/\n```$/i, '');
  
  return code.trim();
}
