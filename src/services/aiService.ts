import { Experiment } from '@/utils/constants';

/**
 * Generates AI-powered responses using Google's Gemini API.
 * Returns a friendly answer scoped to the given experiment.
 */
export async function generateAIResponse(
    question: string,
    experiment: Experiment
): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return 'AI assistant is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.';
    }

    // Build a prompt containing all relevant experiment information
    const context = `
You are a friendly lab teacher helping a +2 (Grade 11-12) science student in Nepal with the following experiment:

**Experiment:** ${experiment.title}
**Subject:** ${experiment.subject}
**Description:** ${experiment.description}

**Objectives:**
${experiment.objectives?.map((obj, i) => `${i + 1}. ${obj}`).join('\n') || 'Not specified'}

**Apparatus:**
${experiment.apparatus?.join(', ') || 'Not specified'}

**Steps:**
${experiment.steps?.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n') || 'Not specified'}

**IMPORTANT RULES:**
1. ONLY answer questions related to THIS experiment.
2. If the question is unrelated, politely say: "Please ask questions related to this experiment only."
3. Use simple, clear language suitable for high‑school students.
4. Explain concepts step‑by‑step.
5. Encourage curiosity.
6. Keep answers concise (2‑3 sentences max).
7. If the student asks in Nepali (Devanagari script), respond in Nepali.
8. If the student asks in English, respond in English.

Student's question: ${question}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: context }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                        topP: 0.8,
                        topK: 40,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) {
            throw new Error('No response from AI');
        }
        return aiResponse.trim();
    } catch (error) {
        console.error('AI API Error:', error);
        // Consistent fallback message used elsewhere in the UI
        return 'Sorry, I am having trouble connecting right now. Please try again in a moment.';
    }
}

/** Simple language detection – returns 'ne' for Nepali characters, otherwise 'en'. */
export function detectLanguage(text: string): 'ne' | 'en' {
    const nepaliRegex = /[\u0900-\u097F]/;
    return nepaliRegex.test(text) ? 'ne' : 'en';
}
