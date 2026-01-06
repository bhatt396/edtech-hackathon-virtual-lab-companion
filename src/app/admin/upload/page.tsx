"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, PlayCircle, Beaker } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function RAGDemoPage() {
    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Evaluation State
    const [evalState, setEvalState] = useState<string>(
        "The student added 25mL of NaOH rapidly. The solution turned dark pink immediately. No initial reading was taken."
    );
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // --- File Upload Handlers ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadMessage(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setUploadMessage({ type: 'success', text: data.message });
            setFile(null);
        } catch (err) {
            setUploadMessage({ type: 'error', text: 'Failed to upload. Is the python server running on port 8000?' });
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    // --- Evaluation Handler ---
    const handleEvaluate = async () => {
        if (!evalState.trim()) return;

        setEvaluating(true);
        setFeedback(null);

        try {
            const res = await fetch('http://localhost:8000/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state: evalState }),
            });

            if (!res.ok) throw new Error('Evaluation failed');

            const data = await res.json();
            setFeedback(data.feedback);
        } catch (err) {
            console.error(err);
            setFeedback("Error: Failed to get evaluation from Gemini. Ensure documents are uploaded and server is running.");
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col md:flex-row gap-8 justify-center items-start">

            {/* LEFT COLUMN: Document Upload */}
            <Card className="w-full max-w-md shadow-xl bg-white">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">1. Upload Knowledge</CardTitle>
                            <CardDescription>Upload a lab manual (PDF/TXT) to train the AI.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-colors hover:border-blue-400 group cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.txt"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            {file ? (
                                <>
                                    <FileText className="w-10 h-10 text-blue-500" />
                                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">Drag & Drop Lab Manual</span>
                                </>
                            )}
                        </div>
                    </div>

                    {uploadMessage && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {uploadMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {uploadMessage.text}
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Upload & Index'}
                    </Button>
                </CardContent>
            </Card>

            {/* RIGHT COLUMN: Experiment Evaluation */}
            <Card className="w-full max-w-xl shadow-xl bg-white">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Beaker className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">2. Evaluate Experiment</CardTitle>
                            <CardDescription>Simulate a student action and get AI feedback.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Experiment State Description</label>
                        <Textarea
                            value={evalState}
                            onChange={(e) => setEvalState(e.target.value)}
                            className="h-32 focus:ring-purple-500 text-slate-700"
                            placeholder="Describe what the student did..."
                        />
                    </div>

                    <Button
                        onClick={handleEvaluate}
                        disabled={!evalState || evaluating}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11"
                    >
                        {evaluating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing with Gemini...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Evaluate Action
                            </>
                        )}
                    </Button>

                    {feedback && (
                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">AI Feedback:</h3>
                            <div className="prose prose-sm text-slate-700/90 leading-relaxed whitespace-pre-wrap">
                                {feedback}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
