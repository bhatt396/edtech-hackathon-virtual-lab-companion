# Lab Experiment Evaluator - RAG Pipeline

A **LangChain-powered RAG pipeline** that evaluates virtual lab experiment states using uploaded documents and **Google Gemini AI**.

## 🌟 Features

- **📄 Document Upload**: Upload PDF, DOCX, or TXT files containing theory, procedures, and safety guidelines
- **🔍 Vector Search**: ChromaDB-powered semantic search for relevant information
- **🤖 AI Evaluation**: Gemini analyzes each experiment state against uploaded documents
- **📊 Comprehensive Feedback**: Score, correctness assessment, suggestions, and safety warnings
- **🔗 RESTful API**: Easy integration with any frontend

## 🏗️ Architecture

```
┌─────────────────┐
│   Documents     │
│  (PDF/DOCX/TXT) │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Document Processor  │
│  - Text Extraction  │
│  - Chunking         │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Vector Store      │
│   (ChromaDB)        │
│  + Google Embeddings│
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐      ┌──────────────────┐
│ Experiment State    │─────▶│  Gemini AI       │
│  - Step tracking    │      │  - Evaluation    │
│  - Actions          │      │  - Feedback      │
│  - Observations     │      │  - Suggestions   │
└─────────────────────┘      └──────────────────┘
```

## 🚀 Quick Start

### 1. Installation

```bash
cd /home/bhaskar/Documents/hackathon/RAG
npm install
```

### 2. Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GOOGLE_API_KEY=your_actual_api_key_here
PORT=3001
```

**Get your Gemini API key**: https://aistudio.google.com/app/apikey

### 3. Start the Server

```bash
npm run dev
```

You should see:
```
✅ Document Processor initialized
✅ Connected to existing ChromaDB collection
✅ Experiment Evaluator initialized

✨ Server running on http://localhost:3001
```

### 4. Run Tests

In a **new terminal**:

```bash
npm test
```

This will:
- Upload a sample titration theory document
- Search for relevant information
- Evaluate experiment states
- Generate comprehensive feedback

## 📡 API Endpoints

### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data

file: <PDF/DOCX/TXT file>
type: "theory" | "procedure" | "safety" | "general"
experimentType: "Acid-Base Titration" (optional)
```

**Response:**
```json
{
  "success": true,
  "documentId": "uuid",
  "metadata": {
    "filename": "titration-theory.pdf",
    "chunks": 15,
    "type": "theory"
  }
}
```

### Evaluate Single State
```http
POST /evaluate/state
Content-Type: application/json

{
  "stateId": "state-1",
  "experimentName": "Acid-Base Titration",
  "stepNumber": 1,
  "stepName": "Setup",
  "timestamp": "2024-01-06T10:00:00Z",
  "parameters": { ... },
  "studentActions": ["action1", "action2"],
  "observations": ["observation1"],
  "measurements": { "pH": 7.0 }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "stateId": "state-1",
    "score": 85,
    "correctness": "correct",
    "feedback": "Good setup procedure...",
    "suggestions": ["Consider...", "Next time..."],
    "relevantTheory": ["Theory point 1", "Theory point 2"],
    "safetyIssues": []
  }
}
```

### Evaluate Full Experiment
```http
POST /evaluate/experiment
Content-Type: application/json

{
  "states": [
    { /* state 1 */ },
    { /* state 2 */ },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "evaluations": [ /* individual evaluations */ ],
  "summary": "Overall performance summary...",
  "averageScore": 87.5
}
```

### Search Documents
```http
POST /search
Content-Type: application/json

{
  "query": "What is the titration procedure?",
  "experimentType": "Acid-Base Titration",
  "k": 5
}
```

### List Documents
```http
GET /documents
```

### Delete Document
```http
DELETE /documents/:documentId
```

## 💻 Integration Example

### Frontend Integration (React/Next.js)

```typescript
// Upload a document
async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'theory');
  formData.append('experimentType', 'Acid-Base Titration');

  const response = await fetch('http://localhost:3001/documents/upload', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}

// Evaluate experiment state
async function evaluateState(state: ExperimentState) {
  const response = await fetch('http://localhost:3001/evaluate/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });

  const data = await response.json();
  return data.evaluation;
}
```

## 📊 Experiment State Format

```typescript
interface ExperimentState {
  stateId: string;              // Unique identifier
  experimentName: string;       // e.g., "Acid-Base Titration"
  stepNumber: number;           // Current step (1, 2, 3...)
  stepName: string;             // e.g., "Setup and Calibration"
  timestamp: Date;              // When this state occurred
  parameters: Record<string, any>;  // Equipment settings
  studentActions?: string[];    // What the student did
  observations?: string[];      // What the student observed
  measurements?: Record<string, number>;  // Numeric data
}
```

## 🔧 Customization

### Adjust Chunk Size
Edit `src/services/documentProcessor.ts`:
```typescript
this.textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,     // Adjust this
  chunkOverlap: 200,   // And this
});
```

### Change Gemini Model
Edit `src/services/experimentEvaluator.ts`:
```typescript
this.llm = new ChatGoogleGenerativeAI({
  modelName: 'gemini-2.0-flash-exp',  // Or gemini-pro
  temperature: 0.3,
});
```

### Customize Evaluation Prompt
Modify `evaluationPrompt` in `src/services/experimentEvaluator.ts` to change how Gemini evaluates experiments.

## 🧪 Supported Experiments

The system is experiment-agnostic! Just upload relevant documents for any experiment:

- **Physics**: Pendulum, Ohm's Law, Optics
- **Chemistry**: Titration, pH, Dilution, Reactions
- **Biology**: Microscopy, Cell observation
- Any other lab experiment!

## 📁 Project Structure

```
RAG/
├── src/
│   ├── services/
│   │   ├── documentProcessor.ts    # PDF/DOCX/TXT processing
│   │   ├── vectorStore.ts          # ChromaDB management
│   │   └── experimentEvaluator.ts  # Gemini evaluation
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── index.ts                    # Express server
│   └── test.ts                     # Test suite
├── uploads/                        # Temporary file storage
├── package.json
├── tsconfig.json
└── .env
```

## 🚨 Troubleshooting

### ChromaDB Connection Issues
```bash
# Use in-memory ChromaDB (default) or install server:
docker run -p 8000:8000 chromadb/chroma
```

### "GOOGLE_API_KEY not found"
Make sure `.env` exists and contains:
```env
GOOGLE_API_KEY=your_key_here
```

### File Upload Fails
Check file size (max 50MB) and format (PDF, DOCX, TXT only).

## 📚 Next Steps

1. **Add more documents** for better evaluation accuracy
2. **Track experiment history** - store states in a database
3. **Build a dashboard** - visualize student progress
4. **Add authentication** - secure the API
5. **Deploy to production** - use persistent ChromaDB

## 🔗 Resources

- [LangChain Docs](https://js.langchain.com/docs/)
- [Gemini API](https://ai.google.dev/docs)
- [ChromaDB](https://www.trychroma.com/)

---

**Built with ❤️ for Nepali +2 Students**
