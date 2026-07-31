# ====================================================
# Imports
# ====================================================
import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# ====================================================
# Configuration
# ====================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(CURRENT_DIR, "data")
VECTORSTORE_PATH = os.path.join(CURRENT_DIR, "vectorstore")
INDEX_FAISS_PATH = os.path.join(VECTORSTORE_PATH, "index.faiss")
INDEX_PKL_PATH = os.path.join(VECTORSTORE_PATH, "index.pkl")

# ====================================================
# Initialize Embedding Model
# ====================================================
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ====================================================
# Load Documents
# ====================================================
def load_documents():
    print("Loading documents...")
    loader = DirectoryLoader(
        DATA_PATH,
        glob="*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    documents = loader.load()
    return documents

# ====================================================
# Build Vector Store
# ====================================================
def build_vector_store():
    print("Building vector database...")
    documents = load_documents()
    
    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    
    print("Generating embeddings...")
    embeddings = get_embeddings()
    
    print("Creating FAISS index...")
    db = FAISS.from_documents(chunks, embeddings)
    
    print("Saving vector database...")
    if os.path.exists(INDEX_FAISS_PATH):
        os.remove(INDEX_FAISS_PATH)
    if os.path.exists(INDEX_PKL_PATH):
        os.remove(INDEX_PKL_PATH)
        
    db.save_local(VECTORSTORE_PATH)
    return db

# ====================================================
# Load Existing Vector Store
# ====================================================
def load_vector_store():
    print("Loading vector database...")
    embeddings = get_embeddings()
    db = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return db

# ====================================================
# Initialize LLM
# ====================================================
# Placeholder for future LLM integration
llm = None

# ====================================================
# Create Retriever
# ====================================================
# Placeholder for future retriever creation
retriever = None

# ====================================================
# Create RAG Chain
# ====================================================
# Placeholder for future RAG chain creation
rag_chain = None

# ====================================================
# Chat Function
# ====================================================
# Placeholder for future AI chat functionality
def chat_with_assistant(query):
    return "AI Chat feature not implemented yet."

# ====================================================
# Main
# ====================================================
def main():
    if os.path.exists(INDEX_FAISS_PATH) and os.path.exists(INDEX_PKL_PATH):
        db = load_vector_store()
    else:
        print("Vector database not found.")
        db = build_vector_store()
    print("Vector database ready.")

if __name__ == "__main__":
    main()
