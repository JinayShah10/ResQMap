# ====================================================
# Imports
# ====================================================
import os
import sys
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI

# ====================================================
# Configuration
# ====================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(CURRENT_DIR, "data")
VECTORSTORE_PATH = os.path.join(CURRENT_DIR, "vectorstore")
INDEX_FAISS_PATH = os.path.join(VECTORSTORE_PATH, "index.faiss")
INDEX_PKL_PATH = os.path.join(VECTORSTORE_PATH, "index.pkl")

# Global variables for LCEL RAG components
db = None
embeddings = None
llm = None
retriever = None
rag_chain = None

# ====================================================
# Initialize Embedding Model
# ====================================================
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ====================================================
# Load Documents
# ====================================================
def load_documents():
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
    documents = load_documents()
    
    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    
    print("Generating embeddings...")
    # embeddings already loaded in get_embeddings()
    
    print("Creating FAISS index...")
    db_instance = FAISS.from_documents(chunks, embeddings)
    
    print("Saving vector database...")
    if os.path.exists(INDEX_FAISS_PATH):
        os.remove(INDEX_FAISS_PATH)
    if os.path.exists(INDEX_PKL_PATH):
        os.remove(INDEX_PKL_PATH)
        
    db_instance.save_local(VECTORSTORE_PATH)
    return db_instance

# ====================================================
# Load Existing Vector Store
# ====================================================
def load_vector_store():
    db_instance = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return db_instance

# ====================================================
# Initialize LLM, Retriever, and LCEL Chain
# ====================================================
def initialize_system():
    global db, embeddings, llm, retriever, rag_chain
    
    print("Loading environment...")
    load_dotenv()
    
    print("Loading embeddings...")
    embeddings = get_embeddings()
    
    print("Loading FAISS...")
    if os.path.exists(INDEX_FAISS_PATH) and os.path.exists(INDEX_PKL_PATH):
        db = load_vector_store()
    else:
        print("Vector database not found.")
        print("Building vector database...")
        print("Loading documents...")
        db = build_vector_store()
        
    print("Initializing Gemini...")
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        google_api_key = "DUMMY_GOOGLE_API_KEY"
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=google_api_key
    )
    
    print("Building LCEL pipeline...")
    retriever = db.as_retriever(search_kwargs={"k": 4})
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are ResQMap AI, a professional emergency response assistant. "
            "Your behavior must be calm, accurate, practical, and highly professional. "
            "Do not hallucinate facts. Answer the user's question using only the retrieved context below. "
            "If the answer is not available in the context, clearly state that sufficient verified information is unavailable. "
            "For life-threatening or critical situations, always recommend contacting professional emergency services immediately.\n\n"
            "Context:\n{context}"
        )),
        ("human", "{question}"),
    ])
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
        
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    print("Ready.")

# Automatically initialize system when imported or executed
initialize_system()

# ====================================================
# Chat Function
# ====================================================
def chat(query):
    return rag_chain.invoke(query)

# ====================================================
# Main
# ====================================================
def main():
    print("ResQMap AI Ready")
    try:
        while True:
            try:
                query = input("> ")
            except (EOFError, KeyboardInterrupt):
                break
            if not query.strip():
                continue
            if query.strip().lower() in ["exit", "quit"]:
                break
            try:
                response = chat(query)
                print(response)
            except Exception as e:
                print(f"Error: {e}")
            print()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
