# ====================================================
# Imports
# ====================================================
import os
import sys
import ssl

# Bypass SSL certificate verification issues (e.g. self-signed certificates in chain)
ssl._create_default_https_context = ssl._create_unverified_context

# Disable online hub queries to prevent startup lag and connection timeouts
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

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
    print("Loading documents...", file=sys.stderr)
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
    
    print("Splitting documents...", file=sys.stderr)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    
    print("Generating embeddings...", file=sys.stderr)
    
    print("Creating FAISS index...", file=sys.stderr)
    db_instance = FAISS.from_documents(chunks, embeddings)
    
    print("Saving vector database...", file=sys.stderr)
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
    print("Loading vector database...", file=sys.stderr)
    db_instance = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return db_instance

# ====================================================
# Initialize LLM, Retriever, and LCEL Chain
# ====================================================
def initialize_system():
    global db, embeddings, llm, retriever, rag_chain
    
    print("Loading environment...", file=sys.stderr)
    # Target the backend/.env file explicitly
    dotenv_path = os.path.join(CURRENT_DIR, "..", ".env")
    if not os.path.exists(dotenv_path):
        raise FileNotFoundError("Google API key not found in backend/.env")
        
    load_dotenv(dotenv_path=dotenv_path)
    
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key or google_api_key.strip() == "":
        raise ValueError("Google API key not found in backend/.env")
    
    print("Loading embeddings...", file=sys.stderr)
    embeddings = get_embeddings()
    
    print("Loading FAISS...", file=sys.stderr)
    if os.path.exists(INDEX_FAISS_PATH) and os.path.exists(INDEX_PKL_PATH):
        db = load_vector_store()
    else:
        print("Vector database not found.", file=sys.stderr)
        print("Building vector database...", file=sys.stderr)
        db = build_vector_store()
        
    print("Initializing Gemini...", file=sys.stderr)
    # Use the latest supported Flash model in this environment (gemini-3.6-flash)
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        google_api_key=google_api_key
    )
    
    print("Building LCEL pipeline...", file=sys.stderr)
    retriever = db.as_retriever(search_kwargs={"k": 15})
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an experienced disaster management expert with over 50 years of field experience. "
            "Your behavior must be calm, supportive, practical, clear, and highly professional. "
            "You must answer the user's question using only the provided context. "
            "Do not invent any treatments, medicine dosages, or unsafe advice. Do not hallucinate. "
            "If the retrieved context does not contain enough information to safely and accurately answer the question, "
            "you MUST output ONLY this exact sentence and nothing else: "
            "\"I don't have enough verified information to answer that safely.\"\n\n"
            "Strict Writing & Formatting Rules:\n"
            "1. Rewriting: Professionally rewrite the retrieved information. Never copy large portions of the context verbatim. "
            "Understand the context, summarize it, and rewrite it naturally.\n"
            "2. Spacing and Structure: Keep spacing clean. Avoid walls of text. Use proper Markdown:\n"
            "   # [Main Heading]\n"
            "   A short introduction (2-3 sentences) explaining the situation.\n\n"
            "   [EMERGENCY WARNING - Include ONLY if the situation is life-threatening or a critical emergency, placed directly after the introduction]\n"
            "   ⚠️ Emergency\n"
            "   This situation may require immediate professional medical attention. Contact your local emergency services immediately if the person's condition worsens or they become unconscious.\n\n"
            "   ## Immediate Actions\n"
            "   Use a numbered list (1., 2., 3., etc.).\n\n"
            "   ## Important Precautions\n"
            "   Use bullet points starting with the literal bullet character '•' (e.g., • Precaution).\n\n"
            "   ## What NOT to Do\n"
            "   Use bullet points starting with the literal bullet character '•' (e.g., • Action to avoid).\n\n"
            "   ## When to Seek Emergency Help\n"
            "   Clearly explain when immediate professional medical or emergency assistance is required.\n\n"
            "   ## Additional Advice\n"
            "   Provide practical recommendations that improve safety.\n"
            "3. Forbidden Phrases: Never say \"according to the context\", \"based on the retrieved document\", "
            "\"the provided information states\", or mention AI, vector databases, or prompt instructions.\n"
            "4. Simple English: Use simple language, explain any technical terms briefly, and use bold formatting for important warnings.\n"
            "5. Word Limit: Aim for 250-500 words. Do not produce excessively long answers.\n\n"
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
    
    print("Ready.", file=sys.stderr)

# Automatically initialize system when imported or executed
try:
    initialize_system()
except Exception as e:
    print(f"Initialization Error: {e}", file=sys.stderr)
    sys.exit(1)

# ====================================================
# Chat Function
# ====================================================
def chat(query):
    return rag_chain.invoke(query)

# ====================================================
# Main
# ====================================================
def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--api":
        # API Mode: Read single query from stdin, output only the answer to stdout, and exit.
        try:
            query = sys.stdin.read().strip()
            if not query:
                sys.exit(0)
            response = chat(query)
            print(response)
        except Exception as e:
            if "404" in str(e) or "NOT_FOUND" in str(e):
                print("Model gemini-3.6-flash failed: model not found or unsupported.", file=sys.stderr)
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Interactive CLI Mode
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
                    if "404" in str(e) or "NOT_FOUND" in str(e):
                        print("Model gemini-3.6-flash failed: model not found or unsupported.", file=sys.stderr)
                    print(f"Error: {e}")
                print()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    main()
