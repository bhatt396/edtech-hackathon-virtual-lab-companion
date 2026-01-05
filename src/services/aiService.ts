import { Experiment } from '@/utils/constants';

/**
 * Generates AI-powered responses using Google's Gemini API.
 * Returns a friendly answer scoped to the given experiment.
 */
// Hardcoded "Dummy" AI Knowledge Base for Acid-Base Titration
const ACID_BASE_QA: Record<string, string> = {
    "explain about this experiment": "In this Acid-Base Titration experiment, you are determining the concentration of an unknown acid (HCl) by reacting it with a strong base (NaOH) of known concentration. The goal is to find the exact point (neutralization) where the acid is completely reacted, indicated by a color change.",
    "what is an indicator": "An indicator is a substance that changes color at a specific pH level. In this experiment, we use Phenolphthalein. It is colorless in acidic solutions and turns pale pink in basic solutions (around pH 8.2).",
    "how do i calculate molarity": "You can calculate molarity using the formula: M₁V₁ = M₂V₂. \n\n• M₁ = Molarity of Acid (Unknown)\n• V₁ = Volume of Acid (fixed, e.g., 20mL)\n• M₂ = Molarity of Base (Known)\n• V₂ = Volume of Base used (from Burette reading)\n\nRearrange to solve for M₁: M₁ = (M₂ × V₂) / V₁",
    "when should i stop titrating": "You should stop titrating (adding base) immediately when you see a faint, permanent pink color appear in the flask. This is the 'endpoint', indicating that neutralization is complete.",
    "safety precautions": "Always wear safety goggles and a lab coat. Handle acids and bases carefully as they can be corrosive. If you spill any on your skin, wash it immediately with plenty of water.",
    "what is the endpoint": "The endpoint is the stage in the titration where the indicator changes color, signaling that the equivalent amount of titrant has been added to the analyte."
};

export async function generateAIResponse(
    question: string,
    experiment: Experiment
): Promise<string> {
    // 1. Check for Hardcoded "Dummy" Responses for Acid-Base Titration
    if (experiment.id === 'acid-base-titration') {
        const normalizedQuestion = question.toLowerCase().trim();

        // Simple fuzzy match: check if the question contains key phrases from our DB
        const matchKey = Object.keys(ACID_BASE_QA).find(key => normalizedQuestion.includes(key) || key.includes(normalizedQuestion));

        if (matchKey || normalizedQuestion.includes('explain') || normalizedQuestion.includes('experiment')) {
            // Simulate "AI Thinking" delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (normalizedQuestion.includes('explain') || normalizedQuestion.includes('experiment')) {
                return ACID_BASE_QA["explain about this experiment"];
            }
            return ACID_BASE_QA[matchKey!];
        }
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        // Fallback if no API key is present, ensuring the dummy mode still feels "smart" for other basic queries
        if (experiment.id === 'acid-base-titration') return "I can specifically answer questions about molarity, indicators, and the endpoint for this experiment. Try asking!";
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
                        maxOutputTokens: 500,
                        topP: 0.8,
                        topK: 40,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                    ]
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
