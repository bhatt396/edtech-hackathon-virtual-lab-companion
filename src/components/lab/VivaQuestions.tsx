import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VivaQuestion, getVivaQuestions } from '@/utils/vivaQuestions';
import { Download, BrainCircuit, CheckCircle2, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface VivaQuestionsProps {
    experimentId: string;
}

export function VivaQuestions({ experimentId }: VivaQuestionsProps) {
    const [questions, setQuestions] = useState<VivaQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        // Reset state when experiment changes
        const fetchedQuestions = getVivaQuestions(experimentId);
        setQuestions(fetchedQuestions);
        resetQuiz();
    }, [experimentId]);

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    const handleOptionSelect = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
    };

    const checkAnswer = () => {
        if (selectedOption === null) return;

        setIsAnswered(true);
        if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
            toast.success('Correct Answer!', { duration: 1500 });
        } else {
            toast.error('Incorrect Answer', { duration: 1500 });
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const downloadQuestions = () => {
        if (questions.length === 0) return;

        let content = `Viva Questions for Experiment ID: ${experimentId}\n\n`;
        questions.forEach((q, idx) => {
            content += `Q${idx + 1}: ${q.question}\n`;
            q.options.forEach((opt, i) => {
                content += `   (${String.fromCharCode(65 + i)}) ${opt}\n`;
            });
            content += `Answer: ${q.options[q.correctAnswer]}\n`;
            if (q.explanation) content += `Explanation: ${q.explanation}\n`;
            content += `\n----------------------------------------\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${experimentId}-viva-questions.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Questions downloaded successfully!');
    };

    if (questions.length === 0) {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        Viva Questions
                    </CardTitle>
                    <CardDescription>No questions available for this experiment yet.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (showResult) {
        return (
            <Card className="border-border bg-card animate-fade-in">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        Quiz Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <div className="text-4xl font-black mb-2 text-primary">
                        {score} / {questions.length}
                    </div>
                    <p className="text-muted-foreground mb-6">
                        {score === questions.length ? 'Perfect Score! 🎉' : 'Good effort! Keep practicing.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={resetQuiz} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                        <Button variant="outline" onClick={downloadQuestions} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download Questions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        Viva Questions
                    </CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary/10 px-2 py-1 rounded">
                        {currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="text-sm font-medium leading-relaxed">
                    {currentQuestion.question}
                </div>

                <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => {
                        let variant = "outline";
                        let className = "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200";

                        if (isAnswered) {
                            if (idx === currentQuestion.correctAnswer) {
                                className += " border-green-500 bg-green-500/10 text-green-700 hover:bg-green-500/20";

                            } else if (idx === selectedOption) {
                                className += " border-red-500 bg-red-500/10 text-red-700 hover:bg-red-500/20";
                            } else {
                                className += " opacity-50";
                            }
                        } else {
                            if (selectedOption === idx) {
                                className += " border-primary bg-primary/5 text-primary";
                            } else {
                                className += " hover:bg-muted/50";
                            }
                        }

                        return (
                            <Button
                                key={idx}
                                variant="outline"
                                className={className}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={isAnswered}
                            >
                                <div className="flex items-center w-full gap-3">
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${selectedOption === idx || (isAnswered && idx === currentQuestion.correctAnswer)
                                            ? 'border-current'
                                            : 'border-muted-foreground/30 text-muted-foreground'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="flex-1 whitespace-normal">{option}</span>
                                    {isAnswered && idx === currentQuestion.correctAnswer && (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                    )}
                                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswer && (
                                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                    )}
                                </div>
                            </Button>
                        );
                    })}
                </div>

                {isAnswered && currentQuestion.explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground animate-fade-in">
                        <span className="font-semibold text-blue-600 block mb-1">Explanation:</span>
                        {currentQuestion.explanation}
                    </div>
                )}

            </CardContent>

            <CardFooter className="pt-0">
                {!isAnswered ? (
                    <Button
                        className="w-full gap-2"
                        onClick={checkAnswer}
                        disabled={selectedOption === null}
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Button
                        className="w-full gap-2"
                        onClick={nextQuestion}
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
