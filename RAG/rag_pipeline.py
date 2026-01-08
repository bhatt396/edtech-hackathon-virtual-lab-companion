import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Updated imports for new LangChain versions
from langchain_community.document_loaders import PyPDFLoader, UnstructuredFileLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

# ---------------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Fallback or error - raising error is safer for a required key
    raise EnvironmentError("GEMINI_API_KEY not found in .env file")

# ---------------------------------------------------------------------------
# Initialize Gemini LLM
# ---------------------------------------------------------------------------
# Using 'gemini-flash-latest' for better free tier limits
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL, 
    google_api_key=GEMINI_API_KEY,
    temperature=0.3
)

# ---------------------------------------------------------------------------
# Load documents
# ---------------------------------------------------------------------------
def load_documents(source_dir: str) -> List[Document]:
    docs: List[Document] = []
    path = Path(source_dir)
    if not path.exists():
        print(f"Warning: Source directory '{source_dir}' does not exist.")
        return []

    for file_path in path.rglob("*.*"):
        try:
            loader = None
            if file_path.suffix.lower() == ".pdf":
                loader = PyPDFLoader(str(file_path))
            elif file_path.suffix.lower() in {".docx", ".doc", ".txt", ".md"}:
                loader = UnstructuredFileLoader(str(file_path))
            
            if loader:
                print(f"Loading {file_path}...")
                docs.extend(loader.load())
        except Exception as e:
            print(f"Failed to load {file_path}: {e}")
            
    return docs

# ---------------------------------------------------------------------------
# Chunk documents
# ---------------------------------------------------------------------------
def chunk_documents(docs: List[Document]) -> List[Document]:
    if not docs:
        return []
        
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )
    return splitter.split_documents(docs)

# ---------------------------------------------------------------------------
# Vector Store (Chroma + Google Embeddings)
# ---------------------------------------------------------------------------
def get_vector_store(chunks: List[Document], persist_dir: str = "./chroma_db") -> Chroma:
    # Use Google's newer embedding model which has better quota/limits
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004", 
        google_api_key=GEMINI_API_KEY
    )
    
    if chunks:
        print(f"Creating vector store with {len(chunks)} chunks...")
        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=persist_dir,
        )
    else:
        print("No new documents to index. Loading existing vector store...")
        vector_store = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings
        )
        
    return vector_store

# ---------------------------------------------------------------------------
# Add single document to Vector Store
# ---------------------------------------------------------------------------
def add_to_vector_store(file_path: str, persist_dir: str = "./chroma_db"):
    docs = []
    path = Path(file_path)
    try:
        loader = None
        if path.suffix.lower() == ".pdf":
            loader = PyPDFLoader(str(path))
        elif path.suffix.lower() in {".docx", ".doc", ".txt", ".md"}:
            loader = UnstructuredFileLoader(str(path))
        
        if loader:
            print(f"Loading {path}...")
            docs.extend(loader.load())
    except Exception as e:
        print(f"Failed to load {path}: {e}")
        return False

    if not docs:
        return False

    chunks = chunk_documents(docs)
    
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004", 
        google_api_key=GEMINI_API_KEY
    )
    
    # Load existing store and add documents
    vector_store = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings
    )
    
    vector_store.add_documents(chunks)
    return True

# ---------------------------------------------------------------------------
# Retrieve Context
# ---------------------------------------------------------------------------
def retrieve_context(vector_store: Chroma, query: str, k: int = 4) -> List[Document]:

    try:
        return vector_store.similarity_search(query, k=k)
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return []

# ---------------------------------------------------------------------------
# Evaluate State
# ---------------------------------------------------------------------------
def evaluate_state(state_description: str, context_docs: List[Document]) -> str:
    context_text = "\n\n---\n\n".join([doc.page_content for doc in context_docs])
    
    prompt = (
        "You are an expert Chemistry Lab Instructor. Your task is to critique a student's experiment state "
        "by comparing it strictly against the provided Reference Material (Standard Procedure/Theory).\n\n"
        
        "### 1. REFERENCE MATERIAL (Standard Procedure):\n"
        f"{context_text}\n\n"
        
        "### 2. STUDENT EXPERIMENT STATE:\n"
        f"{state_description}\n\n"
        
        "### INSTRUCTIONS:\n"
        "Compare the Student's State against the Reference Material.\n"
        "Provide your evaluation in the following format:\n"
        "- **Status**: [Correct / Incorrect / Partially Correct]\n"
        "- **Deviation**: (If incorrect, strictly state what step was missed or done wrong based on the docs)\n"
        "- **Feedback**: (Constructive correction for the student)\n"
        "- **Safety Check**: (Flag any safety violations with [SAFETY HAzARD] tag if found)\n"
        "- **Next Step Hint**: (Briefly hint at what should happen next according to the procedure)\n"
    )
    
    response = llm.invoke(prompt)
    return str(response.content)

if __name__ == "__main__":
    # Test run
    docs = load_documents("./documents")
    chunks = chunk_documents(docs)
    store = get_vector_store(chunks)
    
    example_state = "The titration has reached the endpoint, solution is dark pink."
    context = retrieve_context(store, example_state)
    feedback = evaluate_state(example_state, context)
    
    print("\n=== Gemini Evaluation ===")
    print(feedback)
