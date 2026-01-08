import os
import shutil
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Import pipeline utilities
from rag_pipeline import (
    load_documents,
    chunk_documents,
    get_vector_store,
    retrieve_context,
    evaluate_state,
    add_to_vector_store
)

# Template configuration
templates = Jinja2Templates(directory="templates")

# Global placeholder for the vector store
vector_store = None
DOCS_PATH = "./documents"
UPLOAD_DIR = "./uploads"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown logic.
    """
    global vector_store
    print("Loading reference documents from", DOCS_PATH)
    # Check if we should load documents or just load existing store
    # This logic mimics get_vector_store behavior which handles existing store if no new docs
    docs = load_documents(DOCS_PATH)
    chunks = chunk_documents(docs)
    
    # Initialize the store
    vector_store = get_vector_store(chunks)
    print("Vector store ready.")
    
    yield
    
    # Shutdown logic (if any)
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Add CORS so React frontend can call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve the upload page template."""
    return templates.TemplateResponse("upload.html", {"request": request})

class EvalRequest(BaseModel):
    state: str

@app.post("/evaluate")
async def evaluate(req: EvalRequest):
    try:
        if vector_store is None:
            raise HTTPException(status_code=503, detail="Vector store not initialized")
            
        context_docs = retrieve_context(vector_store, req.state)
        feedback = evaluate_state(req.state, context_docs)
        return {"feedback": feedback}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"feedback": f"Error during evaluation: {str(e)}", "error": True}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF/DOCX/TXT file to be indexed.
    """
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Index the file
    success = add_to_vector_store(file_path)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to process document")
    
    # RELOAD the vector store so the new doc is immediately available for search
    global vector_store
    # We pass empty list to load from existing persistence directory
    vector_store = get_vector_store([]) 
    print("Vector store reloaded with new data.")
         
    return {"message": f"Successfully uploaded and indexed {file.filename}"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
