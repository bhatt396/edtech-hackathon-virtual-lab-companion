export interface VivaQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct option (0-3)
    explanation?: string;
}

export const VIVA_QUESTIONS: Record<string, VivaQuestion[]> = {
    'ohms-law': [
        {
            id: 1,
            question: "What is the relationship between V, I, and R according to Ohm's Law?",
            options: [
                "V = I / R",
                "V = I * R",
                "R = V * I",
                "I = V * R"
            ],
            correctAnswer: 1,
            explanation: "Ohm's Law states that Voltage (V) is directly proportional to Current (I), with Resistance (R) as the constant of proportionality. Thus, V = IR."
        },
        {
            id: 2,
            question: "Which of the following materials is an ohmic conductor?",
            options: [
                "Diode",
                "Copper Wire",
                "Transistor",
                "Electrolyte"
            ],
            correctAnswer: 1,
            explanation: "Copper wire is a metal and follows Ohm's law at constant temperature, making it an ohmic conductor."
        },
        {
            id: 3,
            question: "What happens to the current if resistance is doubled while voltage remains constant?",
            options: [
                "Current doubles",
                "Current halves",
                "Current remains same",
                "Current becomes zero"
            ],
            correctAnswer: 1,
            explanation: "Since I = V/R, if R is doubled, I becomes V/(2R) = (1/2) * (V/R), so current halves."
        }
    ],
    'pendulum': [
        {
            id: 1,
            question: "The time period of a simple pendulum depends on:",
            options: [
                "Mass of the bob",
                "Amplitude of oscillation",
                "Length of the string",
                "Material of the bob"
            ],
            correctAnswer: 2,
            explanation: "The time period T = 2π√(L/g) depends only on the length (L) and acceleration due to gravity (g), independent of mass."
        },
        {
            id: 2,
            question: "If the length of a pendulum is quadrupled, its time period will:",
            options: [
                "Double",
                "Quadruple",
                "Halve",
                "Remain same"
            ],
            correctAnswer: 0,
            explanation: "T is proportional to √L. If L becomes 4L, T becomes √(4L) = 2√L, so the time period doubles."
        },
        {
            id: 3,
            question: "What provides the restoring force in a simple pendulum?",
            options: [
                "Tension",
                "Gravity",
                "Component of Gravity (mg sinθ)",
                "Centripetal force"
            ],
            correctAnswer: 2,
            explanation: "The component of the bob's weight acting tangential to the arc, mg sinθ, acts as the restoring force."
        }
    ],
    'acid-base-titration': [
        {
            id: 1,
            question: "Which indicator is commonly used for strong acid-strong base titration?",
            options: [
                "Phenolphthalein",
                "Methyl Orange",
                "Litmus",
                "Any of the above"
            ],
            correctAnswer: 0,
            explanation: "Phenolphthalein is a suitable indicator as it changes color in the pH range 8.3-10.0, capturing the steep pH change at the equivalence point."
        },
        {
            id: 2,
            question: "What is the point called where the reaction is just complete?",
            options: [
                "Starting point",
                "End point",
                "Equivalence point",
                "Saturation point"
            ],
            correctAnswer: 2,
            explanation: "The equivalence point is where the number of moles of acid equals the number of moles of base."
        }
    ]
};

export const getVivaQuestions = (experimentId: string): VivaQuestion[] => {
    return VIVA_QUESTIONS[experimentId] || [];
};
